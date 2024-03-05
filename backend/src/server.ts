
// @deno-types="npm:@types/express@4.17.21"
import express from "express"
import cors from "cors"
import "https://deno.land/x/dotenv/load.ts";
import postRouter from "./routes/postsRouter.ts"
import subredditRouter from "./routes/subredditRouter.ts"
import authRouter from "./routes/authRouter.ts"
import { Session, User } from "lucia";
import { validateRequest } from "./auth/auth.ts";
import bodyParser from "body-parser";

const app = express()
const whitelist = ["http://localhost:3000", "http://localhost:5173"]
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
app.use("/api/subreddits", subredditRouter)

app.get("/", (req, res) => {
    res.redirect("http://localhost:5173")
})

app.get("/protected", validateRequest, (req, res) => {
    if(res.locals.session)
        return res.status(202).json({
            message: "You're connected !",
            user: res.locals.user
        })
    
    res.status(403).json({message: "refused"})
})

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