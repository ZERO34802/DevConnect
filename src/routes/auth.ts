import express from "express";
import { validateUserLoginData , UserSignUpDataValid } from "../utils/validation.js";
import { userModel } from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import HttpError  from "../utils/HttpError.js";

export const authRouter = express.Router();

authRouter.post("/login",async (req,res)=> {
    try {
        //validate user login info - emailid and password
        if(validateUserLoginData(req.body)) {
            const query = {
                email : req.body.email.trim()
            }
            const password = req.body.password;
            const user = await userModel.findOne(query);
            
            if(!user) {
                throw new HttpError(401, "Invalid Credentials");
            }

            if("password" in user && user.password !== null && user.password !== undefined) {
                const passWordCheck = await bcrypt.compare(password, user?.password);
                if(passWordCheck) {
                    const token = await jwt.sign({_id : user._id},"testingjwt",
                        {
                            expiresIn : "7d"
                        }
                    );
                    res.cookie("token",token);
                    res.status(200).send("Login Successful!");
                }else {
                    throw new HttpError(401, "Invalid Credentials");
                }
            }else {
                throw new HttpError(401, "Invalid Credentials");
            }
        }else {
            throw new HttpError(401, "Invalid Credentials");
        }
    }catch (err){
        if(err instanceof HttpError) {
            res.status(err.status).send(err.message);
        }else if(err instanceof Error) {
            console.log(err);
            res.status(500).send("Unknown Error, Contact Support");
        }else {
            console.log(err);
            res.status(500).send("Unknown Error, Contact Support");
        }
    }
});

authRouter.post("/signup",async (req,res) => {
    const userData : unknown = req.body;
    console.log(userData);
    if(UserSignUpDataValid(userData)) {
        try {
            const { password } = userData;
            if(/\s/.test(password)) {
                throw new HttpError(400, "Password cannot have spaces");
            }
            const userObj = {
                "firstName" : userData?.firstName.trim(),
                "lastName" : userData?.lastName.trim(),
                "email" : userData?.email.trim(),
                "age" : userData?.age,
                "userId" : userData?.userId.trim(),
                "password" : await bcrypt.hash(userData?.password, 10)
            }
            const user = new userModel(userObj);
            await user.save();
            res.send("User saved successfully");
        } catch(err) {
            res.status(400).send("Error in adding user...");
        }
    }else {
        res.status(400).send("Invalid Request Data..");
    }
});

authRouter.post("/logout", (req,res) => {
    res.cookie("token",null,
        {
            expires: new Date(Date.now())
        }
    )
    res.status(200).json({ status: 200, message: "Logged out" });
});