import { config } from "dotenv"

config({ path: ".env.local" })

import postgres from "postgres"
import { drizzle } from "drizzle-orm/postgres-js"
import { migrate } from "drizzle-orm/postgres-js/migrator"

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error(
      "\nDATABASE_URL is not set — skipping database migration.\n" +
      "If this is your first deploy, add your Supabase connection string as a Vercel " +
      "environment variable and redeploy. Locally, copy .env.example to .env.local and fill it in.\n"
    )
    process.exit(1)
  }

  const client = postgres(process.env.DATABASE_URL, { prepare: false, max: 1 })
  const db = drizzle(client)

  console.log("Running database migrations...")
  await migrate(db, { migrationsFolder: "./drizzle" })
  console.log("Migrations complete.")
  await client.end()
}

main().catch((error) => {
  console.error("Migration failed:", error)
  process.exit(1)
})
