// Builds the front-end into ./public (served by the Worker as static assets).
//   node scripts/build.mjs
import { build, transform } from "esbuild";
import { compile } from "tailwindcss";
import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, rm, writeFile, copyFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.join(root, "src");
const out = path.join(root, "public");
const require = createRequire(import.meta.url);

async function walk(dir) {
  const files = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...(await walk(p)));
    else files.push(p);
  }
  return files;
}

// ---- 1. JS bundle ----
const js = await build({
  entryPoints: [path.join(src, "main.tsx")],
  bundle: true,
  minify: true,
  format: "esm",
  target: ["es2020"],
  jsx: "automatic",
  define: { "process.env.NODE_ENV": '"production"' },
  tsconfig: path.join(root, "tsconfig.json"),
  write: false,
  legalComments: "none",
});
const jsCode = js.outputFiles[0].text;

// ---- 2. Tailwind v4 CSS (scan source files for class candidates) ----
const sources = (await walk(src)).filter((f) => /\.(tsx?|html)$/.test(f));
const candidates = new Set();
for (const f of sources) {
  const text = await readFile(f, "utf8");
  for (const tok of text.split(/[\s"'`]+/)) {
    for (const t of [tok, ...tok.split(/[{}]/)]) {
      const c = t.replace(/^[^\w!\-[@]+|[,;]+$/g, "");
      if (c && c.length < 120) candidates.add(c);
    }
  }
}
const cssEntry = path.join(src, "styles.css");
const compiler = await compile(await readFile(cssEntry, "utf8"), {
  base: src,
  async loadStylesheet(id, base) {
    const file =
      id === "tailwindcss"
        ? require.resolve("tailwindcss/index.css")
        : id.startsWith("tailwindcss/")
          ? require.resolve(id.endsWith(".css") ? id : `${id}.css`)
          : path.resolve(base, id);
    return { path: file, base: path.dirname(file), content: await readFile(file, "utf8") };
  },
});
const rawCss = compiler.build([...candidates]);
const css = (await transform(rawCss, { loader: "css", minify: true })).code;

// ---- 3. write ./public ----
const hash = createHash("sha256").update(jsCode).update(css).digest("hex").slice(0, 10);
await rm(out, { recursive: true, force: true });
await mkdir(path.join(out, "assets"), { recursive: true });
await writeFile(path.join(out, "assets", "app.js"), jsCode);
await writeFile(path.join(out, "assets", "app.css"), css);
const html = (await readFile(path.join(src, "index.html"), "utf8")).replaceAll("__BUILD__", hash);
await writeFile(path.join(out, "index.html"), html);
for (const f of await readdir(path.join(src, "static"))) {
  await copyFile(path.join(src, "static", f), path.join(out, f));
}
// long cache for hashed assets, never cache the HTML shell
await writeFile(
  path.join(out, "_headers"),
  "/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n/\n  Cache-Control: no-cache\n/index.html\n  Cache-Control: no-cache\n",
);

console.log(
  `built public/  js ${(jsCode.length / 1024).toFixed(1)} KB  css ${(css.length / 1024).toFixed(1)} KB  (${candidates.size} candidates, build ${hash})`,
);
