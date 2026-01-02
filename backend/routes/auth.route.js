import express from "express";
import { logIn, logout, signUp } from "../controllers/auth.controller.js";

const authRouter = express.Router()

authRouter.post("/signup", signUp)
authRouter.post("/login", logIn)
authRouter.get("/logout", logout)

export default authRouter