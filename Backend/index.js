import express from "express"
import dotenv from "dotenv"
import mongoose from "mongoose"
import cors from "cors"
import cookieParser from "cookie-parser"

import userRoute from "./routes/user.route.js";
import messageRoute from "./routes/message.route.js"
import { app, server } from "./SocketIO/server.js"
import path from "path"




dotenv.config();

 app.use(express.json());
 app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

const PORT = process.env.PORT || 5000;
const URI = process.env.MONGODB_URI;

try {
     await mongoose.connect(URI);
    console.log("Conected to MongoDB")
} catch (error) {
    console.log(error);
    
}


// app.get("/", (req,res) => {
//     res.send("start server hello")
// });

app.use("/api/user",userRoute);
app.use("/api/message",messageRoute);

// code for deployment
if (process.env.NODE_ENV === "production") {
    const dirPath = path.resolve();
    app.use(express.static("./Frontend/dist"));
    app.get("/{*splat}", (req, res) => {
    res.sendFile(path.join(dirPath, "./Frontend/dist", "index.html"));
});
}

server.listen(PORT,() =>{
    console.log(`app listion on port ${PORT} link http://localhost:${PORT}/`)
})