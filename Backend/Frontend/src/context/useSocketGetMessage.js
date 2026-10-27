import React, { useEffect } from 'react'
import { useSocketContext } from './SocketContext'
import useConversation from '../zustand/userConversation';
import sound from "../assets/messagesound.mp3"

function useSocketGetMessage() {
    const { socket } = useSocketContext();
    const { messages, setMessage } = useConversation();

    useEffect(() => {
        if (!socket) return;

        socket.on("newMessage", (newMessage) => {
            const notification = new Audio(sound);
            notification.volume = 1.0;
            notification.play().catch((error) => {
                console.log("Sound blocked:", error);
            });
            setMessage([...messages, newMessage]);
        });

        socket.on("conversationDeleted", () => {
            setMessage([]);
        });

        return () => {
            socket.off("newMessage");
            socket.off("conversationDeleted");
        };
    }, [socket, messages, setMessage]);
}

export default useSocketGetMessage;