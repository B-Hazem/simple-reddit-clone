import express from "express"
import 'dotenv/config'
import { log } from "console"
import cors from "cors"

const app = express()
app.use(cors())
app.use(express.json())

app.get("/", (req, res) => {
    res.json({
        "message": "it works!"
    })
})

app.listen(process.env.PORT, () => {
    log("listening to port " + process.env.PORT)
})
