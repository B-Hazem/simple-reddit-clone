// @deno-types="npm:@types/express@4.17.21"
import express from "express";

const userRouter = express.Router()

import {db} from "../db/db.ts"
import { userTable } from "../db/schema.ts";
import { eq } from "npm:drizzle-orm@^0.29.4";

userRouter.get("/:userId", async (req, res) => {
    const result = await db.select({username: userTable.username}).from(userTable).where(eq(userTable.id, req.params.userId))

    res.status(200).json({
        username: result[0].username
    })
})

export default userRouter