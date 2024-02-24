
// @deno-types="npm:@types/express@4.17.21"
import express from "express"
import cors from "cors"
import "https://deno.land/x/dotenv/load.ts";
import postRouter from "./routes/postsRouter.ts"
import authRouter from "./routes/authRouter.ts"
import { Session, User } from "lucia";
import { validateRequest } from "./auth/auth.ts";

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded())


app.use("/api/posts", postRouter)
app.use("/api", authRouter)

app.get("/", (req, res) => {
    res.json({
        "message": "it works!"
    })
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