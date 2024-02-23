import express from "express"
import 'dotenv/config'
import { log } from "console"
import cors from "cors"
import { db } from "./db/db"
import { postTable } from "./db/schema"
import { eq } from "drizzle-orm"
import postRouter from "./routes/postsRouter"

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded())

app.use("/api/posts", postRouter)

app.get("/", (req, res) => {
    res.json({
        "message": "it works!"
    })
})


app.listen(process.env.PORT, () => {
    log("listening to port " + process.env.PORT)
})
