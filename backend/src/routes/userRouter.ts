// @deno-types="npm:@types/express@4.17.21"
import express from "express";

const userRouter = express.Router()

import {db} from "../db/db.ts"
import { userTable, moderatorsTable } from "../db/schema.ts";
import { eq, and } from "npm:drizzle-orm@^0.29.4";
import {validateRequest} from "../auth/auth.ts"
import { subRedditTable } from "../db/schema.ts";
import { bannedUserTable } from "../db/schema.ts";

userRouter.get("/getUsername/:userId", async (req, res) => {
    const result = await db.select({username: userTable.username}).from(userTable).where(eq(userTable.id, req.params.userId))

    res.status(200).json({
        username: result[0].username
    })
})

userRouter.get("/getId/:username", async (req, res) => {
    const result = await db.select({id: userTable.id}).from(userTable).where(eq(userTable.username, req.params.username))

    console.log(req.params.username)

    res.status(200).json({
        userId: result[0].id
    })
})

userRouter.get("/:userId/moderator/:subreddit", validateRequest, async (req, res) => {
    if(!res.locals.session) {
        return res.status(403).json({result: false})
    }
    
    if(res.locals.user!.role == "super-admin") {
        return res.status(200).json({result: true})
    }

    const userId = req.params.userId == "-1" ? res.locals.user!.id : req.params.userId
    

    const check_moderator = await db.select().from(moderatorsTable).where(
        and(
            eq(moderatorsTable.user, userId),
            eq(moderatorsTable.subreddit, req.params.subreddit),
        )
    )

    if(check_moderator.length == 0) {
        return res.status(403).json({result: false})
    } else {
        return res.status(200).json({result: true})
    }
    
})

userRouter.post("/:userId/moderator", validateRequest, async (req, res) => {
    if(!res.locals.session) {
        return res.status(400).json({message: "You can't do this without being logged in"})
    }
    if(!req.body.subreddit) return res.status(400).json({message: "subreddit needs to be sent"}) 

    const check_moderator = await db.select().from(moderatorsTable).where(and(
        eq(moderatorsTable.user , res.locals.user!.id),
        eq(moderatorsTable.subreddit, req.body.subreddit)   
    ))
    const check_creator = await db.select({creatorId: subRedditTable.creatorId}).from(subRedditTable).where(eq(subRedditTable.creatorId, res.locals.user!.id))
    if(check_moderator.length == 0 || check_creator.length == 0) {
        return res.status(400).json({message: "You can't give moderator role to someone without being yourself moderator or subreddit's creator"})
    }

    const check_ban = await db.select().from(bannedUserTable).where(and(
        eq(bannedUserTable.userId, req.params.userId),
        eq(bannedUserTable.subreddit, req.body.subreddit)
    ))

    if(check_ban.length > 0) {
        return res.status(500).json({message: "You can't give moderator status to someone currently banned from your subreddit"})
    }

    try {
        await db.insert(moderatorsTable).values({
            user: req.params.userId,
            subreddit: req.body.subreddit
        })
    } catch (e) {
        return res.status(500).json({message: `An error happend, you probably put the wrong userId`})
    }

    res.status(200).json({message: `Action successful`})

})

userRouter.delete("/:userId/moderator", validateRequest, async (req, res) => {
    if(!res.locals.session) {
        return res.status(400).json({message: "You can't do this without being logged in"})
    }
    if(!req.body.subreddit) return res.status(400).json({message: "subreddit needs to be sent"}) 

    const check_moderator = await db.select().from(moderatorsTable).where(and(
        eq(moderatorsTable.user , res.locals.user!.id),
        eq(moderatorsTable.subreddit, req.body.subreddit)   
    ))
    if(check_moderator.length == 0) {
        return res.status(400).json({message: "You need to be a moderator to remove moderator status to someone"})
    }
    
    const check_creator = await db.select({creatorId: subRedditTable.creatorId}).from(subRedditTable).where(eq(subRedditTable.creatorId, req.params.userId))
    if(check_creator.length > 0) {
        return res.status(400).json({message: "You can't remove moderator status from the creator of the subreddit"})
    }


    try {
        await db.delete(moderatorsTable).where(and(eq(moderatorsTable.user, req.params.userId), eq(moderatorsTable.subreddit, req.body.subreddit)))
    } catch (e) {
        return res.status(400).json({message: "An error happend while removing moderator"})
    }

    res.status(200).json({message: "You successfuly removed moderator status to user"})

})

userRouter.post("/:userId/ban", validateRequest, async (req, res) => {
    if(!res.locals.session) {
        return res.status(400).json({message: "You can't do this without being logged in"})
    }
    if(!req.body.subreddit) return res.status(400).json({message: "subreddit needs to be sent"}) 

    const check_moderator = await db.select().from(moderatorsTable).where(and(
        eq(moderatorsTable.user , res.locals.user!.id),
        eq(moderatorsTable.subreddit, req.body.subreddit)   
    ))
    if(check_moderator.length == 0) {
        return res.status(400).json({message: "You need to be a moderator to ban someone"})
    }

    try {
        await db.insert(bannedUserTable).values({
            userId: req.params.userId,
            subreddit: req.body.subreddit
        })
    } catch (e) {
        return res.status(500).json({message: `An error occured when trying to ban user, check the userId \n`})
    }

    try {
        await db.delete(moderatorsTable).where(and(
            eq(moderatorsTable.user, req.params.userId),
            eq(moderatorsTable.subreddit, req.body.subreddit)
        ))
    } catch (e) {
        return res.status(500).json({message: "An error occured when trying to remove moderator status from the user"})
    }
    
    res.status(200).json({message: `User is successfly banned`})


})

userRouter.post("/:userId/unban", validateRequest, async (req, res) => {
    if(!res.locals.session) {
        return res.status(400).json({message: "You can't do this without being logged in"})
    }
    if(!req.body.subreddit) return res.status(400).json({message: "subreddit needs to be sent"}) 

    const check_moderator = await db.select().from(moderatorsTable).where(and(
        eq(moderatorsTable.user , res.locals.user!.id),
        eq(moderatorsTable.subreddit, req.body.subreddit)   
    ))
    if(check_moderator.length == 0) {
        return res.status(400).json({message: "You need to be a moderator to unban someone"})
    }

    try {
        await db.delete(bannedUserTable).where(and(eq(bannedUserTable.userId, req.params.userId), eq(bannedUserTable.subreddit, req.body.subreddit)))
    } catch (e) {
        return res.status(500).json({message: "An error happend when trying to unban the user"})
    }

    res.status(200).json({message: "User successfuly unbanned"})


})

export default userRouter