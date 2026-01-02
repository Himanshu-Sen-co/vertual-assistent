import express from "express";
import { askToAssistant, getCurrentUser, updateAssistent } from "../controllers/user.controller.js";
import userAuth from "../middlewares/auth.js";
import uploadImage from "../middlewares/multer.js";

const userRouter = express.Router()

userRouter.get("/current",userAuth, getCurrentUser)
userRouter.post("/updateAssistent",userAuth, uploadImage.single("assistentImage"), updateAssistent)
userRouter.post("/asktoassistent",userAuth, askToAssistant)

export default userRouter;