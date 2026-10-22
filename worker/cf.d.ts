// Minimal Cloudflare runtime types used by worker/index.ts (keeps the repo dependency-free).
// If you install @cloudflare/workers-types you can delete this file.
interface D1Result<T> { results: T[]; success: boolean }
interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  run(): Promise<D1Result<unknown>>;
}
interface D1Database { prepare(sql: string): D1PreparedStatement }
interface Fetcher { fetch(input: Request | string, init?: RequestInit): Promise<Response> }
interface ExportedHandler<E> { fetch?(req: Request, env: E, ctx?: unknown): Response | Promise<Response> }
