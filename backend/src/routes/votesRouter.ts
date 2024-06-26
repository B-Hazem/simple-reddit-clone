import { and, desc, eq, sql } from "npm:drizzle-orm";

// @deno-types="npm:@types/express@4.17.21"
import express from "npm:express";
import { db } from "../db/db.ts";
import { postTable, subRedditTable, upVotesUserTables, downVotesUserTables } from "../db/schema.ts";
import { validateRequest } from "../auth/auth.ts";
const votesRouter = express.Router()

votesRouter.get("/up/:userId", async (req, res) => {
    const result = await db.select(
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
    ).from(upVotesUserTables).where(eq(upVotesUserTables.user, req.params.userId))
    .innerJoin(postTable, eq(postTable.id, upVotesUserTables.upVotedPost))
    
    res.json(result)
    
})

votesRouter.post("/up", validateRequest, async (req, res) => {
    if(!res.locals.session || !res.locals.user) {
        return res.status(401).json({message: "You can't upvote a post if you're not connected"})
    }

    if(!req.body.postId) return res.status(400).json({message: "postId is missing from body data"})
    const postId = req.body.postId

    const upVotedPosts = await db.select().from(upVotesUserTables).where(and(
        eq(upVotesUserTables.user, res.locals.user.id),
        eq(upVotesUserTables.upVotedPost, postId)
    ))

    const downVotedPosts = await db.select().from(downVotesUserTables).where(and(
        eq(downVotesUserTables.user, res.locals.user.id),
        eq(downVotesUserTables.downVotedPost, postId)
    ))
    

    //Already up voted the post
    if(upVotedPosts.length > 0) {
        //decrement posts.upVotes count
        await db.run(sql`UPDATE ${postTable} SET upVotes = upVotes - 1 WHERE ${postTable.id} = ${postId}`)
        
        //remove from the upVotes relation table
        await db.delete(upVotesUserTables).where(and(
            eq(upVotesUserTables.user, res.locals.user.id),
            eq(upVotesUserTables.upVotedPost, postId)
        ))
    
        return res.status(200).json("up votes been removed cause already upvoted")
    }

    //Already down voted the post
    if(downVotedPosts.length > 0) {
        //decrement post.downVotes count
        await db.run(sql`UPDATE ${postTable} SET downVotes = downVotes - 1 WHERE ${postTable.id} = ${postId}`)
        //remove from downVotes relation table
        await db.delete(downVotesUserTables).where(and(
            eq(downVotesUserTables.user, res.locals.user.id),
            eq(downVotesUserTables.downVotedPost, postId)
        )) 

    }

    //increment post.upVotes count
    await db.run(sql`UPDATE ${postTable} SET upVotes = upVotes + 1 WHERE ${postTable.id} = ${postId}`)
    //add to upVotes relation table
    try {
        await db.insert(upVotesUserTables).values({
            user: res.locals.user.id,
            upVotedPost: postId
        })
    } catch (e) {
        return res.status(400).json({message: `An error has occured during insertion (${e.code})`})
    }

    res.status(200).json({message: "Post upvoted"})
})


votesRouter.get("/:postId", async (req, res) => {
    const postId = +req.params.postId
    const result = (await db.select({upVotes: postTable.upVotes, downVotes: postTable.downVotes}).from(postTable).where(eq(postTable.id, postId)))[0]

    return res.status(200).json(result)
})

votesRouter.post("/down", validateRequest, async (req, res) => {
    if(!res.locals.session || !res.locals.user) {
        return res.status(401).json({message: "You can't downvote a post if you're not connected"})
    }

    if(!req.body.postId) return res.status(400).json({message: "postId is missing from body data"})
    const postId = req.body.postId

    const upVotedPosts = await db.select().from(upVotesUserTables).where(and(
        eq(upVotesUserTables.user, res.locals.user.id),
        eq(upVotesUserTables.upVotedPost, postId)
    ))

    const downVotedPosts = await db.select().from(downVotesUserTables).where(and(
        eq(downVotesUserTables.user, res.locals.user.id),
        eq(downVotesUserTables.downVotedPost, postId)
    ))

    //already down voted the post
    if(downVotedPosts.length > 0) {
        //decrement post.downVotes count
        await db.run(sql`UPDATE ${postTable} SET downVotes = downVotes - 1 WHERE ${postTable.id} = ${postId}`)
        
        //remove from downVotes relation table
        await db.delete(downVotesUserTables).where(and(
            eq(downVotesUserTables.user, res.locals.user.id),
            eq(downVotesUserTables.downVotedPost, postId)
        )) 
        return res.status(200).json("down votes been removed cause already upvoted")
    }

    //alreadt up voted the post
    if(upVotedPosts.length > 0) {
        //decrement post.upVotes count
        await db.run(sql`UPDATE ${postTable} SET upVotes = upVotes - 1 WHERE ${postTable.id} = ${postId}`)

        //remove from upVotes relation table
        await db.delete(upVotesUserTables).where(and(
            eq(upVotesUserTables.user, res.locals.user.id),
            eq(upVotesUserTables.upVotedPost, postId)
        ))
    
    }

    await db.run(sql`UPDATE ${postTable} SET downVotes = downVotes + 1 WHERE ${postTable.id} = ${postId}`)
    try {
        await db.insert(downVotesUserTables).values({
            user: res.locals.user.id,
            downVotedPost: postId
        })
    } catch (e) {
        return res.status(400).json({message: `An error has occured during insertion (${e.code})`})
    }

    res.status(200).json({message: "Post downvoted"})
})



export default votesRouter