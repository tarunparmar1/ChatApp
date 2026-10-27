import React from 'react'

function Messege({ message }) {
    const authUser = JSON.parse(localStorage.getItem("chatapp"));

    if (!message) return null;

    const itsMe = message.senderId === authUser?.user?._id;
    const chatname = itsMe ? "chat-end" : "chat-start";
    const chatColor = itsMe
        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
        : "bg-[#252836] text-gray-200 border border-gray-700/40";

    const createdAt = new Date(message.createdAt);
    const formattedTime = createdAt.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    });

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
        </div>
    );
}

export default Messege;