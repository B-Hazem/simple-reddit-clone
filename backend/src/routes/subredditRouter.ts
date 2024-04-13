import { and, eq } from "drizzle-orm";
// @deno-types="npm:@types/express@4.17.21"
import express from "express";
import { db } from "../db/db.ts";
import { postTable, subRedditTable, moderatorsTable, bannedUserTable } from "../db/schema.ts";
import { validateRequest } from "../auth/auth.ts";
import { userTable } from "../db/schema.ts";
import { followedSubredditTable } from "../db/schema.ts";

const subRedditRouter = express.Router()

//TODO: error handling in case of wrong :name
subRedditRouter.get("/info/:name", async (req, res) => {
    const subredditName = req.params.name

    const subRedditInfo = (await db.select().from(subRedditTable).where(eq(subRedditTable.name, subredditName)))[0]

    res.json(subRedditInfo)
})


subRedditRouter.get("/", async (req, res) => {
    const subs = await db.select().from(subRedditTable)
    res.json(subs)
})

subRedditRouter.get("/:name/moderators", async (req, res) => {
    const moderators = await db.select({username: userTable.username, userId: userTable.id}).from(userTable)
        .innerJoin(moderatorsTable, and(eq(moderatorsTable.user, userTable.id) ,eq(moderatorsTable.subreddit, req.params.name)))

    res.status(200).json(moderators)
})

subRedditRouter.post("/", validateRequest, async (req, res) => {
    if(!res.locals.session) {
        return res.status(402).json({message: "you're not allowed to create subreddits if you're not connected"})
    }
    
    const name = req.body.newName as string
    if(name.includes(' ')) return res.status(400).json({message: "you're not allowed to insert spaces in names of subreddits"})
    if(name.length > 31) return res.status(400).json({message: "You're subreddit name is too long (it can't be longer than 31 characters"})

    const description = req.body.newDescription as string
    if(description.length > 150) return res.status(400).json({message: "You're subreddit description is too long (it can't be longer than 150 characters"})

    const result = await db.insert(subRedditTable).values({
        name: name,
        description: description,
        creatorId: res.locals.user?.id
    }).onConflictDoNothing()

    if(result.rowsAffected > 0) {
        try {
            await db.insert(moderatorsTable).values({
                user: res.locals.user!.id,
                subreddit: name
            })
        } catch (e) {
            await db.delete(subRedditTable).where(eq(subRedditTable.name, name))

            return res.status(500).json({message: `Error while giving the moderator role to the creator, reverting everything \n ${e}`})
        }

        return res.status(300).json({message: `Yay! r/${name} has been created`})
    } else {
        return res.status(400).json({message: "An error occured when you tried creating this subreddit. Perhaps the name is already taken??"})
    }

})

subRedditRouter.get("/ban/:subreddit", validateRequest, async (req, res) => {
    if(!res.locals.session) return res.status(400).json({message: "You're not logged in"})

    const check_moderator = await db.select().from(moderatorsTable).where(and(
        eq(moderatorsTable.user, res.locals.user!.id),
        eq(moderatorsTable.subreddit, req.params.subreddit)
    ))
    if(check_moderator.length == 0) return res.status(403).json({message: "You're not a moderator"})

    const bannedUsername = await db.select({username: userTable.username, userId: userTable.id}).from(userTable)
        .innerJoin(bannedUserTable, and(eq(bannedUserTable.userId, userTable.id), eq(bannedUserTable.subreddit, req.params.subreddit)))
    

    res.status(200).json(bannedUsername)
    
})

subRedditRouter.post("/ban", validateRequest, async (req, res) => {
    if(!res.locals.session) return res.status(400).json({message: "You're not logged in"})
    if(req.body.subreddit == "" || req.body.username == "") return res.status(400).json({message: "need to provide a subreddit and username"})

    const check_moderator = await db.select().from(moderatorsTable).where(and(
        eq(moderatorsTable.user, res.locals.user!.id),
        eq(moderatorsTable.subreddit, req.body.subreddit)
    ))
    if(check_moderator.length == 0) return res.status(403).json({message: "You're not a moderator"})
    
    const userId = await db.select({id: userTable.id}).from(userTable).where(eq(userTable.username, req.body.username))
    if(userId.length == 0) return res.status(400).json({message: `User ${req.body.username} not found`})

    try {
        await db.insert(bannedUserTable).values({
            userId: userId[0].id,
            subreddit: req.body.subreddit
        }).onConflictDoNothing()
    } catch (e) {
        return res.status(500).json({message: `An error occured when trying to ban user(${req.body.username} \n ${e}`})
    }
    
    res.status(200).json({message: `User with id ${req.body.username} is banned from r/${req.body.subreddit}`})


})

subRedditRouter.get("/follow", validateRequest, async (req, res) => {
    if(!res.locals.session) return res.status(400).json({message: "You're not logged in"})

    const result = await db.select({
        name: subRedditTable.name,
        description: subRedditTable.description,
    }).from(followedSubredditTable).where(eq(followedSubredditTable.userId, res.locals.user!.id))
        .innerJoin(subRedditTable, eq(subRedditTable.name, followedSubredditTable.subreddit))


    res.status(200).json(result)
})

subRedditRouter.get("/follow/:subreddit", validateRequest, async (req, res) => {
    if(!res.locals.session) return res.status(400).json({message: "You're not logged in"})

    const result = await db.select({
        name: followedSubredditTable.subreddit,
    }).from(followedSubredditTable)
        .where(
            and(
                eq(followedSubredditTable.userId, res.locals.user!.id),
                eq(followedSubredditTable.subreddit, req.params.subreddit)
            )
    )

    if(result.length == 0) {
        return res.status(200).json({result: false})
    }

    res.status(200).json({result: true})
})



subRedditRouter.post("/follow", validateRequest, async (req, res) => {
    if(!res.locals.session) return res.status(400).json({message: "You're not logged in"})
    if(req.body.subreddit == "") return res.status(400).json({message: "Need to provide subreddit"})

    try {
        await db.insert(followedSubredditTable).values({
            userId: res.locals.user!.id,
            subreddit: req.body.subreddit
        })
    } catch (e) {
        return res.status(500).json({message: "An error occured when trying to follow the subreddit"})
    }

    res.status(200).json({message: "Successfuly followed the subreddit"})

})

subRedditRouter.delete("/follow", validateRequest, async (req, res) => {
    if(!res.locals.session) return res.status(400).json({message: "You're not logged in"})
    if(req.body.subreddit == "") return res.status(400).json({message: "Need to provide subreddit"})

    try {
        await db.delete(followedSubredditTable).where(and(
            eq(followedSubredditTable.userId, res.locals.user!.id),
            eq(followedSubredditTable.subreddit, req.body.subreddit)
        ))
    } catch {
        return res.status(500).json({message: "An error occured when trying to unfollow the subreddit"})
    }

    res.status(200).json({message: "You successfuly unfollowed the subreddit"})

})

export default subRedditRouter