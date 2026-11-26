import validator from "validator";
import HttpError from "./HttpError.js";

interface UserSignUpData {
    firstName : string;
    lastName : string;
    userId : string;
    password : string;
    email : string;
    age: number;
}

interface UserProfieEditData {
    firstName? : string,
    lastName? : string,
    userId? : string,
    age? : number,
    about? : string,
    skills? : string[],
    photoUrl? : string,
    gender? : string
}

interface UserPasswordUpdateData {
    oldPassword : string,
    newPassword : string
}



const ALLOWED_USER_SIGN_UP_INFO = ["firstName","lastName","email","age","userId","password"];
const ALLOWED_EDIT: Record<string, (v: unknown)=>boolean> = {
    "firstName" : (v: unknown) => typeof v === "string" && v.trim() !== "",
    "lastName" : (v: unknown) => typeof v === "string" && v.trim() !== "",
    "userId" : (v: unknown) => typeof v === "string" && v.trim() !== "",
    "age" : (v: unknown) => typeof v === "number" && v >= 18,
    "about" : (v: unknown) => typeof v === "string",
    "skills" : (v: unknown) => Array.isArray(v),
    "photoUrl" : (v: unknown) => typeof v === "string",
    "gender" : (v: unknown) => typeof v === "string" && ["Male", "Female", "Other"].includes(v),
}
const ALLOWED_PASSWORD_EDIT: Record<string, (v:unknown) => boolean> = {
    "oldPassword" : (v: unknown) => typeof v === "string" && !((/\s/).test(v)) && v.trim() !== "",
    "newPassword" : (v: unknown) => typeof v === "string" && !((/\s/).test(v)) && v.trim() !== "",   
}
export function UserSignUpDataValid(userData:unknown): userData is UserSignUpData {
    if(typeof userData === "object" && userData !== undefined && userData !== null) {
        if("firstName" in userData && typeof userData.firstName === "string" && userData.firstName.trim() !== ""
            && "lastName" in userData && typeof userData.lastName === "string" && userData.lastName.trim() !== ""
            && "email" in userData && typeof userData.email === "string" && validator.isEmail(userData.email)
            && "age" in userData && typeof userData.age === "number" && userData.age >= 18 && Number.isInteger(userData.age)
            && "userId" in userData && typeof userData.userId === "string" && userData.userId.trim() !== ""
            && "password" in userData && typeof userData.password === "string" && validator.isStrongPassword(userData.password) && (/\s/).test(userData.password)
        ) {
            let isEligible = Object.keys(userData).every((key) => {
                return ALLOWED_USER_SIGN_UP_INFO.includes(key);
            });
            if(isEligible) {
                return true;
            }else throw new Error("Invalid Request Data");
        }
    }
    throw new Error("Invalid Request Data");
}

export const validateUserLoginData = (requestBody : unknown) : requestBody is {email : string, password: string}=> {
    if(requestBody != null && typeof requestBody === "object") {
        if("email" in requestBody && requestBody.email !== null && typeof requestBody.email === "string"
            && "password" in requestBody && requestBody.password !== null && typeof requestBody.password === "string"
        ) {
            let { email, password} = requestBody;
            email = email;
            password = password;
            if(email !== "" && validator.isEmail(email) && password !== "")return true;
        }
    }
    throw new Error("Invalid Request Data");
}

export const validateProfileEditData = (requestBody : unknown) : requestBody is UserProfieEditData => {
    if(requestBody != null && typeof requestBody === "object") {
        const isAllowed = Object.entries(requestBody).every(([key, value]) => {
           const check = ALLOWED_EDIT[key];
           return check !== undefined && check(value);
        });
        if(isAllowed)return true;
        else {
            throw new HttpError(400, "Invalid Request Data");
        }
    }else {
        throw new Error("Invalid Request Data");
    }
}

export const validPasswordUpdateData = (requestBody: unknown) : requestBody is UserPasswordUpdateData => {
    if(requestBody !== null && typeof requestBody === "object") {
        const isAllowed = Object.entries(requestBody).every(([key,value] )=> {
            const check = ALLOWED_PASSWORD_EDIT[key];
            return check !== undefined && check(value);
        });

        if (isAllowed 
            && "oldPassword" in requestBody && typeof requestBody.oldPassword === "string"
            && "newPassword" in requestBody && typeof requestBody.newPassword === "string") {
                return true;
        }
        else {
            throw new HttpError(400, "Invalid Request Data");
        }
    }else {
        throw new Error("Invalid Request Data");
    }
}