import { and, desc, eq, sql } from "drizzle-orm";
// @deno-types="npm:@types/express@4.17.21"
import express from "express";
import { db } from "../db/db.ts";
import { postTable, subRedditTable, upVotesUserTables, downVotesUserTables } from "../db/schema.ts";
import { validateRequest } from "../auth/auth.ts";
const votesRouter = express.Router()


votesRouter.post("/up", validateRequest, async (req, res) => {
    if(!res.locals.session || !res.locals.user) {
        return res.status(400).json({message: "You can't upvote a post if you're not connected"})
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
    
        return res.status(300).json("up votes been removed cause already upvoted")
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

        console.log("got rid of the down vote cause user trying to upvote a post they already down voted")
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

    res.status(300).json({message: "Should work??"})
})


votesRouter.get("/:postId", async (req, res) => {
    const postId = +req.params.postId
    const result = (await db.select({upVotes: postTable.upVotes, downVotes: postTable.downVotes}).from(postTable).where(eq(postTable.id, postId)))[0]

    return res.status(300).json(result)
})

votesRouter.post("/down", validateRequest, async (req, res) => {
    if(!res.locals.session || !res.locals.user) {
        return res.status(400).json({message: "You can't downvote a post if you're not connected"})
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
        return res.status(300).json("down votes been removed cause already upvoted")
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
    
        console.log("removed up voted because user trying to downvote while already upvoted")
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

    res.status(300).json({message: "Should work??"})
})



export default votesRouter