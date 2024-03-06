import { desc, eq } from "drizzle-orm";
// @deno-types="npm:@types/express@4.17.21"
import express from "express";
import { db } from "../db/db.ts";
import { postTable, subRedditTable } from "../db/schema.ts";
import { validateRequest } from "../auth/auth.ts";
const subRedditRouter = express.Router()


subRedditRouter.get("/:name", async (req, res) => {
    const subredditName = req.params.name

    const subRedditInfo = (await db.select().from(subRedditTable).where(eq(subRedditTable.name, subredditName)))[0]

    res.json(subRedditInfo)
})

subRedditRouter.get("/", async (req, res) => {
    const subs = await db.select().from(subRedditTable)

    res.json(subs)
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
        description: description
    }).onConflictDoNothing()

    if(result.rowsAffected > 0) {
        return res.status(300).json({message: `Yay! r/${name} has been created`})
    } else {
        return res.status(400).json({message: "An error occured when you tried creating this subreddit. Perhaps the name is already taken??"})
    }

})


export default subRedditRouter