import express from "express";
import dotenv from "dotenv";
dotenv.config()
import connectDb from "./config/db.js";
import authRouter from "./routes/auth.route.js";
import cookieParser from "cookie-parser";

import cors from "cors"
import userRouter from "./routes/user.route.js";
import userAuth from "./middlewares/auth.js";
import geminiResponse from "./gemini.js";
const app = express();
const port = process.env.PORT || 5000

app.use(cors({
  origin: ["https://vertual-assistent-1.onrender.com"],
  credentials: true
}));
app.use(express.json())
app.use(cookieParser())
app.use("/api/auth", authRouter)
app.use("/api/user",userAuth, userRouter)

app.get("/", async(req, res) =>{
  let prompt = req.query.prompt
  const data = await geminiResponse(prompt)
  res.send(data)
})

app.listen(port, ()=> {
    connectDb()
    console.log("server started......")}
)
