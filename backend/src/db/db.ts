import {drizzle} from "drizzle-orm/libsql"
import { createClient } from "@libsql/client"
import "https://deno.land/x/dotenv/load.ts";

const client = createClient({
    url: Deno.env.get("DB_URL")!,
    authToken: Deno.env.get("DB_TOKEN"),
})


export const db = drizzle(client)
