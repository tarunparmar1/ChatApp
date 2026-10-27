import React from 'react'
import Chatuser from './Chatuser'
import Messeges from './Messeges'
import Typesend from './Typesend'
import useConversation from '../../zustand/userConversation'
import { useAuth } from "../../context/Authprovider.jsx"
import logo from "../../assets/logo.png"

export function Right() {
  const { selectedConversation } = useConversation();

  return (
    <div className="w-full h-full flex flex-col bg-[#12141C] overflow-hidden">
      {!selectedConversation ? (
        <NoChatSelected />
      ) : (
        <div className="w-full h-full flex flex-col min-h-0">
          <Chatuser />
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            <Messeges />
          </div>
          <Typesend />
        </div>
      )}
    </div>
  );
}

export default Right

const NoChatSelected = () => {
  const [authUser] = useAuth()
  return (
    <div className="flex flex-col h-full w-full items-center justify-center p-6 text-center select-none">
      <div className="flex items-center justify-center mb-6">
        <img
          src={logo}
          alt="NexChat"
          className="w-28 h-28 object-contain drop-shadow-[0_0_24px_rgba(99,102,241,0.25)]"
        />
      </div>
      <h1 className="text-gray-300 text-lg md:text-xl font-medium leading-relaxed max-w-md">
        Welcome, <span className="font-bold text-white bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">{authUser?.user?.fullname || "Friend"}</span>!
        <br />
        <span className="text-gray-400 text-sm mt-2 block font-normal">
          Select a contact from the list on the left to start a conversation.
        </span>
      </h1>
    </div>
  );
}
