import express from "express";
import connectDB from "./config/database.js";
import cookieParser from "cookie-parser";
import { authRouter } from "./routes/auth.js";
import { profileRouter } from "./routes/profile.js";
import { userRouter } from "./routes/user.js";
import { requestRouter } from "./routes/requests.js";

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use("/",authRouter);
app.use("/",profileRouter);
app.use("/",userRouter);
app.use("/",requestRouter);


//right way of connecting is to first connect to the database, then make your server start listening on the port
async function initApp() {
    try {
        await connectDB();
        app.listen(3000, () => {
            console.log("Server is listening on 3000...");
        });
    }catch(err) {
        console.log("Error in initializing app...", err);
    }
}
initApp();

