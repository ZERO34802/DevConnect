import express from "express";
import mongoose from "mongoose";

const connectionRequestSchema = new mongoose.Schema({
    fromUserId : {
        type: mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    toUserId : {
        type : mongoose.Schema.Types.ObjectId,
        ref: "User",
        required : true
    },
    status : {
        type : String,
        required : true,
        enum : {
            values : ["interested","ignored","accepted","rejected"],
            message : `{VALUE} is not allowed`
        }
    }
},{
    timestamps : true
});

connectionRequestSchema.index({fromUserId : 1, toUserId : 1},{ unique:true });

export const connectionRequestModel = mongoose.model("connectionRequests",connectionRequestSchema);