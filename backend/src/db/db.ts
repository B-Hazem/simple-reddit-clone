import {drizzle} from "npm:drizzle-orm/libsql"
import { createClient } from "npm:@libsql/client"

import * as mod from "https://deno.land/std@0.219.0/dotenv/mod.ts";
mod.loadSync({
	envPath: Deno.env.get("ENV") == "prod" ? "./.env.prod" : "./.env.dev",
	defaultsPath: null,
	export: true
})


console.log(Deno.env.get("DB_URL"))

const client = createClient({
    url: Deno.env.get("DB_URL")!,
    authToken: Deno.env.get("DB_TOKEN"),
})


export const db = drizzle(client)
