# STARK.OS — Task Command Protocol

A JARVIS-style sci-fi to-do tracker. Commanders assign missions; Shuja's console shows his missions with deadlines, priorities, sounds and a voice greeting.

**Runs entirely on Cloudflare's free tier:** one Worker serves the app and the API, and tasks are stored in a D1 database.

```
public/            built app (HTML, JS, CSS) — served as static files
src/               React source (components, styles)
worker/index.ts    API: /api/tasks, /api/tasks/:id, /api/health  →  D1
migrations/        D1 database schema
scripts/build.mjs  builds src/ → public/
wrangler.jsonc     Cloudflare config (Worker name, D1 binding)
```

## Deploy (one time, from the Cloudflare dashboard)

The D1 database `stark-todo-db` already exists with the `tasks` table, and its ID is in `wrangler.jsonc`.

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Import a repository**.
2. Pick GitHub repo **shandrif/To-Do-list**, branch `main`.
3. Project name: **stark-todo** (must match `name` in `wrangler.jsonc`).
4. Build command: `npm run build` · Deploy command: `npx wrangler deploy`.
5. Deploy. Your app is live at `https://stark-todo.<your-subdomain>.workers.dev`.

Every push to `main` redeploys automatically.

## API

| Method | Path | Body / query |
|---|---|---|
| GET | `/api/health` | — |
| GET | `/api/tasks` | `?assignee=Shuja` (optional, case-insensitive) |
| POST | `/api/tasks` | `{ title*, description, assignee, assignedBy, priority, category, dueAt }` |
| PATCH | `/api/tasks/:id` | any of the fields above, plus `status` |
| DELETE | `/api/tasks/:id` | — |

`priority`: low · medium · high · critical — `status`: pending · active · completed — `dueAt`: ISO date or `null`.

## Local development

```bash
npm install
npm run db:migrate:local   # create the table in a local D1
npm run dev                # http://localhost:8787
```

## Note

There is no login: anyone with the link can view, add, edit and delete tasks. Don't share the URL publicly.
