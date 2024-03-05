import { desc, eq } from "drizzle-orm";
// @deno-types="npm:@types/express@4.17.21"
import express from "express";
import { db } from "../db/db.ts";
import { postTable, subRedditTable } from "../db/schema.ts";
const subredditRouter = express.Router()


subredditRouter.get("/:name", async (req, res) => {
    const subredditName = req.params.name

    const subRedditInfo = (await db.select().from(subRedditTable).where(eq(subRedditTable.name, subredditName)))[0]

    res.json(subRedditInfo)
})


export default subredditRouter