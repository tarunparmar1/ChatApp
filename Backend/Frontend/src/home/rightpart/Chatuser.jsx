import React from 'react'
import useConversation from "../../zustand/userConversation.js"
import { useSocketContext } from '../../context/SocketContext.jsx';
import { AiOutlineMenuUnfold } from "react-icons/ai";

function Chatuser() {
    const { selectedConversation } = useConversation();
    const { onlineUsers } = useSocketContext();
    const getOnlineUsersStatus = (userId) => {
        return onlineUsers.includes(userId) ? "Online" : "Offline";
    };
    return (
        <div>
            <label htmlFor='my-drawer-2' className="btn btn-ghost drawer-button lg:hidden absolute left-5">
                <AiOutlineMenuUnfold className="text-white" />
            </label>
            <div className="flex space-x-3 items-center justify-center bg-[#1A1D29] hover:bg-gray-800 duration-300 h-[8vh] border-b-[1px] border-gray-800 px-4 cursor-pointer">

                <div className="bg-gray-300 text-neutral-content w-12 h-12 rounded-full p-1 flex items-center justify-center avatar border-3">
                    <span className="text-3xl text-black">
                        {selectedConversation?.fullname?.charAt(0)}
                    </span>
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
        </div>
    )
}

export default Chatuser