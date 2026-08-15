import http from "http";
import express from "express";
import { Server } from "socket.io";

const app = express();

const server = http.createServer(app);
const io = new Server(server,{
    cors:{
        origin:"http://localhost:5173",
        methods:["GET","POST"],
    }
})

//real time message code gose heare
export const getReceiverSocketId = (receiverId) =>{
    return users[receiverId];
}
const users = {};
//used for listen event on server side

io.on("connection",(socket) => {
    console.log(" user connected",socket.id);
    const userId = socket.handshake.query.userId;
    if(userId){
        users[userId] = socket.id;
        console.log(users);
    }
    //used to sendthe events to all connected users

    io.emit("getOnlineUsers",Object.keys(users));


    //used to listen client side events emitted by server side (server & client)

    socket.on("disconnect",()=>{
        console.log("user disconnected",socket.id);
        delete users[userId];
        io.emit("getOnlineUsers",Object.keys(users));
    })
})

export {app,io,server}