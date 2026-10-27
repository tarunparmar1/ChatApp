import http from "http";
import express from "express";
import { Server } from "socket.io";

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: [
            "http://localhost:5173",
            "https://chatapp-obxh.onrender.com"
        ],
        methods: ["GET", "POST"],
        credentials: true,
    }
});

// Real time message & game socket mapping
export const getReceiverSocketId = (receiverId) => {
    return users[receiverId];
};
const users = {};

io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
        users[userId] = socket.id;
    }

    io.emit("getOnlineUsers", Object.keys(users));

    // ── Realtime Game Events (Tic-Tac-Toe, Connect 4, etc.) ──────────────────
    socket.on("sendGameInvite", ({ to, from, gameType = "tictactoe" }) => {
        const receiverSocketId = getReceiverSocketId(to);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("gameInviteReceived", { from, gameType });
        }
    });

    socket.on("acceptGameInvite", ({ to, from, gameType = "tictactoe" }) => {
        const receiverSocketId = getReceiverSocketId(to);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("gameInviteAccepted", { from, gameType });
        }
    });

    socket.on("declineGameInvite", ({ to }) => {
        const receiverSocketId = getReceiverSocketId(to);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("gameInviteDeclined");
        }
    });

    socket.on("makeGameMove", (payload) => {
        if (!payload?.to) return;
        const receiverSocketId = getReceiverSocketId(payload.to);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("gameMoveReceived", payload);
        }
    });

    socket.on("restartGame", ({ to, gameType }) => {
        const receiverSocketId = getReceiverSocketId(to);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("gameRestarted", { gameType });
        }
    });

    socket.on("leaveGame", ({ to }) => {
        const receiverSocketId = getReceiverSocketId(to);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("gameEnded");
        }
    });

    // ─────────────────────────────────────────────────────────────────────────

    socket.on("disconnect", () => {
        delete users[userId];
        io.emit("getOnlineUsers", Object.keys(users));
    });
});

export { app, io, server };