import { useEffect, useContext, createContext, useState, useRef } from "react";
import { useAuth } from "./Authprovider";
import { io } from "socket.io-client";

const socketContext = createContext();

export const useSocketContext = () => {
    return useContext(socketContext);
};

export const SocketProvider = ({ children }) => {
    const socketRef = useRef(null);          // stable ref so cleanup always works
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [authUser] = useAuth();

    useEffect(() => {
        if (authUser?.user?._id) {
            // Auto-detect: local dev vs production
            // In production, when the frontend is served by Express or on Render,
            // using window.location.origin connects to whatever domain the app is running on.
            const socketUrl =
                window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
                    ? "http://localhost:5000"
                    : window.location.origin || "https://chatapp-obxh.onrender.com";

            const newSocket = io(socketUrl, {
                query: { userId: String(authUser.user._id) },
                withCredentials: true,
                transports: ["websocket", "polling"],
                reconnection: true,
                reconnectionAttempts: 10,
                reconnectionDelay: 1000,
            });

            socketRef.current = newSocket;

            newSocket.on("connect", () => {
                // console.log("[Socket] connected:", newSocket.id);
            });

            newSocket.on("connect_error", (err) => {
                console.error("[Socket] connection error:", err.message);
            });

            newSocket.on("getOnlineUsers", (users) => {
                setOnlineUsers(users);
            });

            // Cleanup on unmount or authUser change
            return () => {
                newSocket.close();
                socketRef.current = null;
                setOnlineUsers([]);
            };
        } else {
            // Logged out — close any existing socket
            if (socketRef.current) {
                socketRef.current.close();
                socketRef.current = null;
            }
            setOnlineUsers([]);
        }
    }, [authUser]);

    return (
        <socketContext.Provider value={{ socket: socketRef.current, onlineUsers }}>
            {children}
        </socketContext.Provider>
    );
};
