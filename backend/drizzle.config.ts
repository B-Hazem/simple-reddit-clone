import { Config } from "drizzle-kit";
import "dotenv/config"

export default {
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  driver: "turso",
  dbCredentials: {
    url: 'http://127.0.0.1:8080',
    authToken: process.env.DB_TOKEN
  }
} satisfies Config;