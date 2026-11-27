import express from "express";
import { userAuth } from "../middlewares/auth.js";
import { validateConnectionRequestData } from "../utils/validation.js";
import HttpError from "../utils/HttpError.js";
import { connectionRequestModel } from "../models/connectionRequest.js";
import { userModel } from "../models/user.js";
export const requestRouter = express.Router();

requestRouter.post("/request/send/:status/:toUserId", userAuth, async (req, res) => {
    try {
        validateConnectionRequestData(req.params);
        const fromUserId = req.user._id;
        const toUserId = req.params.toUserId;

        if(fromUserId.equals(toUserId)) {
            throw new HttpError(400, "Connection Request action not allowed");
        }

        const targetUser = await userModel.findById({
            _id : toUserId
        });

        if(!targetUser) {
            throw new HttpError(400, "Connection Request action not allowed");
        }

        const existingConnection = await connectionRequestModel.findOne({
            $or : [
                {fromUserId : fromUserId, toUserId : toUserId},
                {fromUserId : toUserId, toUserId : fromUserId}
            ]
        });

        if(existingConnection) {
            throw new HttpError(400, "Connection Request already exists");
        }

        const newConnectionObj = {
            fromUserId : fromUserId,
            toUserId : toUserId,
            status : req.params.status
        };

        const newConnection = new connectionRequestModel(newConnectionObj);
        const dbConnectionObj = await newConnection.save();

        res.status(201).json({
            status : 201,
            message : "Connection status established",
            connectionObj : dbConnectionObj
        });
    }catch(err) {
        if(err instanceof HttpError) {
            res.status(err.status).json({
                status: err.status,
                message : err.message
            });
        }else {
            console.log(err);
            res.status(500).json({
                status : 500,
                message : "Unknown Error, Please contact Support"
            });
        }
    }
});