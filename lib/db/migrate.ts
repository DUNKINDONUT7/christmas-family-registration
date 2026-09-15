import { config } from "dotenv"

config({ path: ".env.local" })

import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import { migrate } from "drizzle-orm/neon-http/migrator"

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error(
      "\nDATABASE_URL is not set — skipping database migration.\n" +
      "If this is your first deploy, add a Postgres database from the Vercel Storage tab " +
      "(choose Neon) and redeploy. Locally, copy .env.example to .env.local and fill it in.\n"
    )
    // Do not fail local `next dev` for contributors who haven't set up a DB yet,
    // but this script is opt-in (run via `npm run db:migrate`), so a missing
    // DATABASE_URL here means the caller genuinely isn't ready to migrate.
    process.exit(1)
  }

  const sql = neon(process.env.DATABASE_URL)
  const db = drizzle(sql)

  console.log("Running database migrations...")
  await migrate(db, { migrationsFolder: "./drizzle" })
  console.log("Migrations complete.")
}

main().catch((error) => {
  console.error("Migration failed:", error)
  process.exit(1)
})
