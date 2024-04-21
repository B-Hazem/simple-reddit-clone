import { Config } from "drizzle-kit";
import dotenv from "dotenv"
dotenv.config({path: process.env.ENV == "prod" ? ".env.prod" : ".env.dev"})

export default {
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  driver: "turso",
  dbCredentials: {
    url: process.env.DB_URL!,
    authToken: process.env.DB_TOKEN
  }
} satisfies Config;