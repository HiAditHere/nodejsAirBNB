import express from "express"
import cors from "cors"
import hosts from "./api/host.route.js"
import passport from "passport"


//require('./config/passport')(passport)

const app = express()

app.use(cors())
app.use(express.json())

//require('./config/passport')(passport)

app.use("/api/v1/hosts", hosts)
app.use("*", (req, res) => res.status(404).json({error: "not founds"}))

export default app