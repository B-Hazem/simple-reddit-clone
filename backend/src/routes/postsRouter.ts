import { desc, eq, and, sql, gt } from "drizzle-orm";
// @deno-types="npm:@types/express@4.17.21"
import express from "express";
import { db } from "../db/db.ts";
import { moderatorsTable, postTable, bannedUserTable } from "../db/schema.ts";
import { validateRequest } from "../auth/auth.ts";
import { reportedPost } from "../db/schema.ts";
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

    const check_ban = await db.select().from(bannedUserTable).where(and(
        eq(bannedUserTable.userId, res.locals.user!.id),
        eq(bannedUserTable.subreddit, req.body.subreddit)
    ))
    if(check_ban.length > 0) return res.status(403).json({message: "You're ban from this subreddit, you cannot post here anymore"})
    
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

postRouter.post("/delete", validateRequest, async (req, res) => {
    if(!res.locals.session) return res.status(400).json({message: "You're not logged in"})
    if(req.body.subreddit == "" || req.body.postId == "") return res.status(400).json({message: "need to provide a subreddit and postId"})

    const check_moderator = await db.select().from(moderatorsTable).where(and(
        eq(moderatorsTable.user, res.locals.user!.id),
        eq(moderatorsTable.subreddit, req.body.subreddit)
    ))

    if(check_moderator.length == 0) return res.status(403).json({message: "You're not a moderator"})
    
    const postId = req.body.postId
    
    try {
        await db.delete(postTable).where(eq(postTable.id, postId))
    } catch (e) {
        return res.status(500).json({message: `An error occured while deleting post(${postId}) \n ${e}`})
    }

    res.status(200).json({message: `Post id(${postId}) has been deleted`})

})

postRouter.get("/report/:subredditId", async (req, res) => {
    const reportedPost = await db.select().from(postTable).where(and(
        eq(postTable.subReddit, req.params.subredditId),
        gt(postTable.reportCount, 0)    
    )).orderBy(desc(postTable.reportCount))
    
    res.status(200).json(reportedPost)
})
postRouter.post("/report", validateRequest, async (req, res) => {
    if(!res.locals.session) return res.status(400).json({message: "You're not logged in"})
    if(req.body.postId == "") return res.status(400).json({message: "Need to provide a postId"})

    const check_report = await db.select().from(reportedPost).where(and(
        eq(reportedPost.userId, res.locals.user!.id),
        eq(reportedPost.postId, req.body.postId)
    ))
    if(check_report.length > 0) {
        return res.status(401).json({message: "You have already reported that post"})
    }
    await db.run(sql`UPDATE ${postTable} SET reportCount = reportCount + 1 WHERE ${postTable.id} = ${req.body.postId}`)
    await db.insert(reportedPost).values({
        userId: res.locals.user!.id,
        postId: req.body.postId
    })


    res.status(200).json({message: "The post has been reported to all the moderators !"})
})

export default postRouter