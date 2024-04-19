import { desc, eq, and, sql, gt } from "drizzle-orm";
// @deno-types="npm:@types/express@4.17.21"
import express from "express";
import { db } from "../db/db.ts";
import { moderatorsTable, postTable, bannedUserTable, commentTable, userTable, subRedditTable, followedSubredditTable } from "../db/schema.ts";
import { validateRequest } from "../auth/auth.ts";
import { reportedPostTable } from "../db/schema.ts";
const postRouter = express.Router()

const PostOutput = {
    id: postTable.id,
    title: postTable.title,
    upVotes: postTable.upVotes,
    downVotes: postTable.downVotes,
    createdAt: postTable.createdAt,
    subReddit: postTable.subReddit,
    content: postTable.content,
    authorName: postTable.authorName
}

// /api/posts/recent -> returns posts ordered by most recent
//TODO: Verify if pages and limit are numbers
postRouter.get("/recent", async (req, res) => {
    const pages = req.query.pages
    const limit = req.query.limit


    if(!pages || !limit) {
        return res.status(400).json({message: "You need to provide query ?limit= and ?pages="})
    }

    const r = await db.select().from(postTable).orderBy(desc(postTable.createdAt)).limit(+limit).offset(+limit * +pages)

    res.json(r)
})

postRouter.get("/fromSubreddit/:subRedditName", async (req, res) => {
    const subredditName = req.params.subRedditName
    const limit = parseInt(req.query.limit! as string)  
    const pages  = parseInt(req.query.pages! as string)

    
    if(isNaN(limit) || isNaN(pages)) return res.status(400).json({message: "you need to specify query params limit(int) & pages(int)"})

    const r = await db.select(PostOutput).from(postTable).where(eq(postTable.subReddit, subredditName)).orderBy(desc(postTable.createdAt))
    .limit(limit).offset(limit * pages)
    
    res.json(r)
})

postRouter.get("/single/:postId", async (req, res) => {
    if(!req.params.postId) return res.status(400).json({message: "need to provide postId in body"})
    const postId = parseInt(req.params.postId as string)
    if(isNaN(postId)) return res.status(400).json({message: "postId needs to be a number"})

    const result = await db.select().from(postTable).where(eq(postTable.id, postId))
    

    res.status(200).json(result)
})

postRouter.get("/byAuthor/:userId", async (req, res) => {
    const result = await db.select(PostOutput).from(postTable).innerJoin(userTable, eq(userTable.id, req.params.userId))

    res.status(200).json(result)
})

// /api/posts/hottest -> returns all posts since the beggining of the day ordered by most up voted 
//FIXME
postRouter.get("/hottest", async (req, res) => {
    const r = await db.select().from(postTable)
    .where(
        sql`${postTable.createdAt} BETWEEN datetime('now', "start of day") AND datetime('now')`)
    .orderBy(desc(postTable.upVotes))

    res.json(r)
})

postRouter.post("/", validateRequest , async (req, res) => {

    if(!res.locals.session) {
        return res.status(401).json({
            message: "You're not logged in. You need to log in to create posts"
        })
    }

    const check_ban = await db.select().from(bannedUserTable).where(and(
        eq(bannedUserTable.userId, res.locals.user!.id),
        eq(bannedUserTable.subreddit, req.body.subreddit)
    ))
    if(check_ban.length > 0) return res.status(403).json({message: "You're ban from this subreddit, you cannot post here anymore"})
    
    const title = (req.body.newTitle as string).trim()
    if(title.length > 300 || title.length == 0) return res.status(400).json({message: "The title of your post is too long (limit is 300 characters) or its empty"})

    const content = (req.body.newContent as string).trim()
    if(content.length > 10000 || title.length == 0) return res.status(400).json({message: "The content of your post is too long (limit is 10 000 characters) or its empty"})

    const r = await db.insert(postTable).values({
        title: title,
        content: content,
        subReddit: req.body.subreddit,
        authorName: res.locals.user?.username
    }).onConflictDoNothing()

    if (r.rowsAffected > 0) {
        await db.update(subRedditTable).set({
            nbPost: sql`${subRedditTable.nbPost} + 1`
        })
        .where(eq(subRedditTable.name, req.body.subreddit))

        res.status(200).json({message: "Post created"})
    } else {
        res.status(500).json({message: 'Post not created'})
    }
})  

postRouter.post("/delete", validateRequest, async (req, res) => {
    if(!res.locals.session) return res.status(401).json({message: "You're not logged in"})
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

postRouter.get("/report/:subredditId", validateRequest, async (req, res) => {
    if(!res.locals.session) return res.status(401).json({message: "You're not logged in"})
    
    const reportedPost = await db.select().from(postTable).where(and(
        eq(postTable.subReddit, req.params.subredditId),
        gt(postTable.reportCount, 0)    
    )).orderBy(desc(postTable.reportCount))
    
    res.status(200).json(reportedPost)
})

postRouter.post("/report", validateRequest, async (req, res) => {
    if(!res.locals.session) return res.status(401).json({message: "You're not logged in"})
    if(req.body.postId == "") return res.status(400).json({message: "Need to provide a postId"})

    const check_report = await db.select().from(reportedPostTable).where(and(
        eq(reportedPostTable.userId, res.locals.user!.id),
        eq(reportedPostTable.postId, req.body.postId)
    ))
    if(check_report.length > 0) {
        return res.status(400).json({message: "You have already reported that post"})
    }
    await db.run(sql`UPDATE ${postTable} SET reportCount = reportCount + 1 WHERE ${postTable.id} = ${req.body.postId}`)
    await db.insert(reportedPostTable).values({
        userId: res.locals.user!.id,
        postId: req.body.postId
    })


    res.status(200).json({message: "The post has been reported to all the moderators !"})
})

postRouter.get("/comment/:postId", async(req, res) => {
    const result = await db.select({
        id: commentTable.id,
        username: userTable.username,
        comment: commentTable.comment,
        createdAt: commentTable.createdAt,
    }).from(commentTable)
        .where(eq(commentTable.postId, +req.params.postId))
        .innerJoin(userTable, eq(userTable.id, commentTable.userId))
        .orderBy(desc(commentTable.createdAt))

    res.status(200).json(result)
})

postRouter.post("/comment", validateRequest, async (req, res) => {
    if(!res.locals.session) return res.status(401).json({message: "You're not logged in"})
    if(req.body.postId == "" || req.body.comment == "") return res.status(400).json({message: "Need to provide a postId and a comment"})

    const posts_sub = await db.select({subreddit: postTable.subReddit}).from(postTable).where(eq(postTable.id, +req.body.postId))
    if (posts_sub.length == 0) return res.status(404).json({message: "This postId doesn't exist"})
    
    const check_ban = await db.select().from(bannedUserTable).where(and(
        eq(bannedUserTable.subreddit, posts_sub[0].subreddit!),
        eq(bannedUserTable.userId, res.locals.user!.id)    
    ))
    if (check_ban.length > 0) return res.status(403).json({message: "You are banned from the subreddit's post"})
    
    try {
        await db.insert(commentTable).values({
            userId: res.locals.user!.id,
            comment: req.body.comment,
            postId: req.body.postId
        })
    } catch(e) {
        return res.status(500).json({message: "An error occured when trying to comment this post"})
    }

    res.status(200).json({message: "You successfuly commented this post"})
})



postRouter.delete("/comment", validateRequest, async (req, res) => {
    if(!res.locals.session) return res.status(401).json({message: "You're not logged in"})
    if(req.body.commentId == "") return res.status(400).json({message: "Need to provide a commentId"})

    const check_moderator = await db.select({userId: commentTable.userId}).from(commentTable)
        .where(eq(commentTable.id, req.body.commentId))
        .innerJoin(postTable, eq(commentTable.postId, postTable.id))
        .innerJoin(moderatorsTable, and(eq(moderatorsTable.subreddit, postTable.subReddit), eq(moderatorsTable.user, res.locals.user!.id)))
    
    if(check_moderator.length == 0) return res.status(403).json({message: "You're not a moderator"})

    try {
        await db.delete(commentTable).where(eq(commentTable.id, req.body.commentId));
    } catch(e) {
        return res.status(500).json({message: "An error occured when trying to remove comment"})
    }

    res.status(200).json({message: "Comment successfuly removed"})

})

export default postRouter