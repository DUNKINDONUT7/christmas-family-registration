import postgres from "postgres"
import { drizzle } from "drizzle-orm/postgres-js"
import * as schema from "./schema"

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Copy .env.example to .env.local and fill in your database connection string."
  )
}

// `prepare: false` — required for Supabase's connection pooler (PgBouncer,
// transaction mode), which doesn't support prepared statements. Works
// fine against a direct connection too, so it's safe to always set.
const client = postgres(process.env.DATABASE_URL, { prepare: false })

export const db = drizzle(client, { schema })
