
// @deno-types="npm:@types/express@4.17.21"
import express from "express"
import cors from "cors"
import * as mod from "https://deno.land/std@0.219.0/dotenv/mod.ts";
import postRouter from "./routes/postsRouter.ts"
import subRedditRouter from "./routes/subredditRouter.ts"
import authRouter from "./routes/authRouter.ts"
import userRouter from "./routes/userRouter.ts"
import votesRouter from "./routes/votesRouter.ts"
import { Session, User } from "lucia";
import { validateRequest } from "./auth/auth.ts";
import bodyParser from "body-parser";


const app = express()
const whitelist = [Deno.env.get("CLIENT_URL"), Deno.env.get("SERVER_URL")]
app.use(cors(
    {
        credentials: true,
        origin: whitelist
    }
))
app.use(express.json())
app.use(express.urlencoded())
app.use(bodyParser.json())

app.use("/api/posts", postRouter)
app.use("/api", authRouter)
app.use("/api/subreddits", subRedditRouter)
app.use("/api/votes", votesRouter)
app.use("/api/users", userRouter)



app.listen(Deno.env.get("PORT"), () => {
    console.log("listening to port " + Deno.env.get("PORT"))
})

declare global {
	namespace Express {
		interface Locals {
			user: User | null;
			session: Session | null;
		}
	}
}