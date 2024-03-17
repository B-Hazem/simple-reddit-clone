import { desc, eq, lt, sql } from "drizzle-orm";
// @deno-types="npm:@types/express@4.17.21"
import express from "express";
import { db } from "../db/db.ts";
import { postTable } from "../db/schema.ts";
import { validateRequest } from "../auth/auth.ts";
const postRouter = express.Router()


// /api/posts/recent -> returns posts ordered by most recent
//Should prob limit server-side the number of result for perf concern??
postRouter.get("/recent", async (req, res) => {
    const r = await db.select().from(postTable).orderBy(desc(postTable.createdAt))

    res.json(r)
})

postRouter.get("/:subRedditName", async (req, res) => {
    const subredditName = req.params.subRedditName
    
    const r = await db.select(
        {
            id: postTable.id,
            title: postTable.title,
            upVotes: postTable.upVotes,
            downVotes: postTable.downVotes,
            createdAt: postTable.createdAt,
            subReddit: postTable.subReddit,
            content: postTable.content,
            authorName: postTable.authorName
        }

    ).from(postTable).where(eq(postTable.subReddit, subredditName)).orderBy(desc(postTable.createdAt))
    
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

postRouter.post("/", validateRequest , async (req, res) => {

    if(!res.locals.session) {
        return res.status(400).json({
            message: "You're not logged in. You need to log in to create posts"
        })
    }
    
    const title = req.body.newTitle as string
    if(title.length > 300) return res.status(400).json({message: "The title of your post is too long (limit is 300 characters)"})

    const content = req.body.newContent 
    if(content.length > 10000) return res.status(400).json({message: "The content of your post is too long (limit is 10 000 characters)"})

    const r = await db.insert(postTable).values({
        title: title,
        content: content,
        subReddit: req.body.subreddit,
        authorName: res.locals.user?.username
    }).onConflictDoNothing()

    if (r.rowsAffected > 0) {
        res.status(200).json("good")
    } else {
        res.status(400).json("bad")
    }
})  


export default postRouter