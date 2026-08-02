import React from 'react'

function Messege({message}) {

    const authUser  = JSON.parse(localStorage.getItem("chatapp"));
    const itsMe = message.senderId === authUser.user._id;

    const chatname = itsMe ? "chat-end" : "chat-start";
    const chatColor = itsMe ? "bg-blue-500":"bg-gray-500";
    return (
        <div>
            <div>
                <div className={`chat ${chatname}`}>
                    <div className={`chat-bubble text-white ${chatColor} `}>
                       {message.message}
                    </div>
                </div>

             
            </div>
        </div>
    )
}

export default Messege