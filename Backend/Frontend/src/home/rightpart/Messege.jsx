import React from 'react'

function Messege({ message }) {

    const authUser = JSON.parse(localStorage.getItem("chatapp"));

    if (!message) return null;

    const itsMe = message.senderId === authUser?.user?._id;

    const chatname = itsMe ? "chat-end" : "chat-start";
    const chatColor = itsMe ? "bg-blue-500" : "bg-gray-500";

    const createdAt = new Date(message.createdAt);
    const formattedTime = createdAt.toLocaleTimeString([],{
        hour: '2-digit',
        minute:'2-digit'

    })

    return (
        <div>
            <div className={`chat ${chatname}`}>
                <div className={`chat-bubble text-white ${chatColor}`}>
                    {message.message}
                </div>
                <div className="chat-footer">
                    {formattedTime}
                </div>
            </div>
        </div>
    )
}

export default Messege