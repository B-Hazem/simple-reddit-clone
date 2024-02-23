import { desc, lt, sql } from "drizzle-orm";
import express from "express";
import { db } from "../db/db";
import { postTable } from "../db/schema";
const postRouter = express.Router()


// /api/posts/recent -> returns posts ordered by most recent
//Should prob limit server-side the number of result for perf concern??
postRouter.get("/recent", async (req, res) => {
    const r = await db.select().from(postTable).orderBy(desc(postTable.createdAt))

    res.json(r)
})

// /api/posts/recent -> returns all posts since the beggining of the day ordered by most up voted 
postRouter.get("/hottest", async (req, res) => {
    const r = await db.select().from(postTable)
    .where(
        sql`${postTable.createdAt} BETWEEN datetime('now', "start of day") AND datetime('now')`)
    .orderBy(desc(postTable.upVotes))

    res.json(r)
})



export default postRouter