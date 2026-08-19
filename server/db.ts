import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";

// When DATABASE_URL is unset we do NOT throw at import time — the app falls
// back to in-memory storage (see server/storage.ts). Any accidental use of
// `db`/`pool` without a database throws a clear error at call time instead.
const databaseUrl = process.env.DATABASE_URL;

export const hasDatabase = Boolean(databaseUrl);

function unavailable(): never {
  throw new Error(
    "DATABASE_URL is not set — Postgres is unavailable. The app is running on in-memory storage.",
  );
}

export const pool: pg.Pool = databaseUrl
  ? new pg.Pool({ connectionString: databaseUrl })
  : (new Proxy({}, { get: unavailable }) as pg.Pool);

export const db = databaseUrl
  ? drizzle(pool, { schema })
  : (new Proxy({}, { get: unavailable }) as ReturnType<
      typeof drizzle<typeof schema>
    >);
