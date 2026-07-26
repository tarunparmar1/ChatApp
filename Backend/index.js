import express from "express"
import dotenv from "dotenv"
import mongoose from "mongoose"
import cors from "cors"
import cookieParser from "cookie-parser"

import userRoute from "./routes/user.route.js";

const app = express();


dotenv.config();

 app.use(express.json());
 app.use(cookieParser());
app.use(cors());

const PORT = process.env.PORT || 5000;
const URI = process.env.MONGODB_URI;

try {
    mongoose.connect(URI);
    console.log("Conected to MongoDB")
} catch (error) {
    console.log(error);
    
}


app.get("/", (req,res) => {
    res.send("start server hello")
});

app.use("/api/user",userRoute);

app.listen(PORT,() =>{
    console.log(`app listion on port ${PORT} link http://localhost:${PORT}/`)
})