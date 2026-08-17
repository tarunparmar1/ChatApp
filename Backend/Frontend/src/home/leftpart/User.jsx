import React from 'react'
import useConversation from '../../zustand/userConversation'
import { useSocketContext } from '../../context/SocketContext';

 function User({user}) {

    const { selectedConversation, setSelectedConversation} = useConversation()
    const isSelected= selectedConversation?._id===user._id;
    const {socket, onlineUsers}=useSocketContext()
    const isOnline = onlineUsers.includes(user._id)
  return (
    <div 
    className={`hover:bg-slate-600 duration-100 ${isSelected ? "bg-gray-600":""}`}
    
    onClick={() =>setSelectedConversation(user)}>

             <div className="flex space-x-4 px-6 py-3 hover:bg-gray-600 duration-300 cursor-pointer border border-[#1A1D29] rounded-md  ">
                <div className={`avatar ${isOnline ? "online":""}`}>
                    <div className={`bg-gray-300 text-neutral-content w-12 rounded-full p-1 text-center avatar border-3 ${isOnline === true? "border-green-500":""}`}>
                        <span className="text-3xl text-black">{user.fullname.charAt(0)}</span>
                    </div>
                </div>

                <div >
                    <h1 >
                        {user.fullname}
                    </h1>
                    <span >
                        {user.email}
                    </span>
                </div>
            </div>
    </div>
  )
}

export default User