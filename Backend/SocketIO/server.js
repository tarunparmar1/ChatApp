import http from "http";
import express from "express";
import { Server } from "socket.io";

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: (origin, callback) => {
            // Allow requests with no origin (like mobile apps, curl) or any matching domain
            if (!origin) return callback(null, true);
            if (
                origin.includes("localhost") ||
                origin.includes("127.0.0.1") ||
                origin.includes("onrender.com") ||
                origin.includes("render.com")
            ) {
                return callback(null, true);
            }
            return callback(null, true); // Fallback: allow all origins to prevent socket connection failure
        },
        methods: ["GET", "POST"],
        credentials: true,
    }
});

// Real time message & game socket mapping (supports multiple devices/tabs per user)
const users = {}; // { [userId]: Set of socketIds }

export const getReceiverSocketId = (receiverId) => {
    const socketSet = users[receiverId];
    if (socketSet && socketSet.size > 0) {
        return Array.from(socketSet)[0];
    }
    return null;
};

io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId && userId !== "undefined") {
        if (!users[userId]) {
            users[userId] = new Set();
        }
        users[userId].add(socket.id);
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
        if (userId && users[userId]) {
            users[userId].delete(socket.id);
            if (users[userId].size === 0) {
                delete users[userId];
            }
        }
        io.emit("getOnlineUsers", Object.keys(users));
    });
});

export { app, io, server };