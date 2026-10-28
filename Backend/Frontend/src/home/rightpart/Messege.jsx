import React, { useEffect, useState } from 'react';
import MessageDeleteMenu from '../../components/MessageDeleteMenu';
import { deleteMessage as apiDeleteMessage } from '../../api/messageApi';
import { useSocketContext } from '../../context/SocketContext';

function Messege({ message }) {
    const authUser = JSON.parse(localStorage.getItem("chatapp"));

    if (!message) return null;

    const itsMe = message.senderId === authUser?.user?._id;
    const chatname = itsMe ? "chat-end" : "chat-start";
    const chatColor = itsMe
        ? "bg-[#8b5cf6] text-white"
        : "bg-[#252836] text-gray-200 border border-gray-700/40";

    const createdAt = new Date(message.createdAt);
    const formattedTime = createdAt.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    });
    const [hidden, setHidden] = useState(false);
    const { socket } = useSocketContext();

    const handleDelete = async (type) => {
        try {
            await apiDeleteMessage(message._id, type);
            if (type === 'forMe') setHidden(true);
        } catch (e) {
            console.error('Delete error', e);
        }
    };

    useEffect(() => {
        if (!socket) return;
        const listener = ({ messageId, deleteType }) => {
            if (messageId !== message._id) return;
            if (deleteType === 'forEveryone') setHidden(true);
        };
        socket.on('messageDeleted', listener);
        return () => socket.off('messageDeleted', listener);
    }, [socket, message._id]);
    if (hidden) return null;
    return (
        <div className="px-1">
            <div className={`chat ${chatname}`}>
                <div className={`chat-bubble text-sm md:text-base max-w-[82%] md:max-w-[70%] break-words shadow-sm rounded-2xl ${chatColor}`}>
                    {message.message}
                </div>
                <div className="chat-footer text-[10px] text-gray-500 mt-1 opacity-80">
                    {formattedTime}
                </div>
            </div>
            {itsMe && (
                <MessageDeleteMenu
                    onDeleteForMe={() => handleDelete('forMe')}
                    onDeleteForEveryone={() => handleDelete('forEveryone')}
                />
            )}
        </div>
    );
}

export default Messege;