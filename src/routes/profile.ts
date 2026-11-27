import express from "express";
import { userAuth } from "../middlewares/auth.js";
import { userModel } from "../models/user.js";
import { validateProfileEditData, validPasswordUpdateData } from "../utils/validation.js";
import HttpError from "../utils/HttpError.js";
import validator from "validator"
import bcrypt from "bcrypt";

export const profileRouter = express.Router();

profileRouter.get("/profile/view",userAuth, async (req, res)=> {
    try {
        const userProfile = req.user
        if(!userProfile) {
            throw new HttpError(401,"User Logged Out, Please login again");
        }
        res.status(200).send(userProfile);
    }catch(err) {
        if(err instanceof HttpError) {
            res.status(err.status).send(err.message);
        }else {
            res.status(500).send("Unknown Error");
        }
    }
});

profileRouter.patch("/profile/edit",userAuth, async (req,res) => {
    try {
        // body fields will contain those fields that are to be edited
        // only edit those fields which are allowed to be edited
        const isAllowed = validateProfileEditData(req.body);
        if(isAllowed) {
            const loggedInUser = req.user;
            Object.keys(req.body).forEach((key) => loggedInUser[key] = req.body[key]);
            await loggedInUser.save();
            res.status(200).json({status:200,message : "Profile Updated"});
        }
    }catch(err) {
        if(err instanceof HttpError) {
            res.status(err.status).send(err.message);
        }else {
            console.log(err);
            res.status(500).json({status:500,message:"Unknown Error, Please Contact Support!"});
        }
    }
});

profileRouter.patch("/profile/password",userAuth, async (req, res) => {
    try {
        if(validPasswordUpdateData(req.body)) {
            const { oldPassword, newPassword } = req.body;
            const userObj = req.user;
            const passwordCheck = await bcrypt.compare(oldPassword, userObj.password);
            if(passwordCheck) {
                if((/\s/).test(newPassword) || newPassword.trim() === "" || !validator.isStrongPassword(newPassword)) {
                    throw new HttpError(400, "New Password cannot have spaces or be empty");
                }else if(newPassword === oldPassword) {
                    throw new HttpError(400, "New Password cannot be the same as Old Password");
                }
                userObj["password"] = await bcrypt.hash(newPassword, 10);
                await userObj.save();
                res.cookie("token",null, {
                    expires : new Date(Date.now())
                })
                res.status(200).json({
                    status : 200,
                    message : "Password Reset Successful, Please login again"
                })
            }else {
                throw new HttpError(401, "Incorrect Password");
            }
        }
    }catch(err) {
        if(err instanceof HttpError) {
            res.status(err.status).json({
                status : err.status,
                message : err.message
            })
        }else {
            console.log(err);
            res.status(500).json({
                status : 500,
                message : "Unknown Error, Please contact customer support"
            });
        }
    }
})