import React from 'react'
import useConversation from "../../zustand/userConversation.js"
import { useSocketContext } from '../../context/SocketContext.jsx';

function Chatuser() {
    const {selectedConversation} = useConversation();
    const {onlineUsers} =useSocketContext();
    const getOnlineUsersStatus = (userId) =>{
        return onlineUsers.includes(userId) ? "Online":"Offline";
    };
    return (
        <div className="flex space-x-3 items-center justify-center bg-[#1A1D29] hover:bg-gray-800 duration-300 h-[8vh] border-b-[1px] border-gray-800 px-4 cursor-pointer">
            <div className="avatar avatar-online size-[4.5rem]">
                <div className="w-24  rounded-full p-3">
                    <img src="https://img.daisyui.com/images/profile/demo/gordon@192.webp" className="rounded-full" />
                </div>
            </div>
            <div className="text-white">
                <h1 className="text-xl ">
                    {selectedConversation?.fullname || "Select a user"}
                </h1>
                <span className="text-sm">
                   {getOnlineUsersStatus(selectedConversation._id)} 
                </span>
            </div>
        </div>
    )
}

export default Chatuser