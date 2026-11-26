import express from "express";
import { userModel } from "../models/user.js";

export const userRouter = express.Router();

userRouter.get("/feed",async (req,res) => {
    try {
        const allUsers = await userModel.find({});
        res.status(200).json(allUsers);
    } catch (err) {
        res.status(404).send("No Users Found!");
    }
});