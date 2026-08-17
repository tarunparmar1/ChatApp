import React, { useEffect } from 'react'
import Chatuser from './Chatuser'
import Messeges from './Messeges'
import Typesend from './Typesend'
import useConversation from '../../zustand/userConversation'
import {useAuth} from "../../context/Authprovider.jsx"
import { AiOutlineMenuUnfold } from "react-icons/ai";
import logo from "../../assets/logo.png"


export function Right() {
  const { selectedConversation, setSelectedConversation } = useConversation()
  useEffect(() => {
    return setSelectedConversation(null)
  }, [setSelectedConversation]);
  return (
      <div className=" w-full border border-black bg-[#12141C]">
    <div>
      {!selectedConversation ? (<NoChatSelected />) : (<>
        <Chatuser />
        <Messeges />
        <Typesend />

      </>)}
      </div>
    </div>

  );
}

export default Right

const NoChatSelected = () => {
  const [authUser] = useAuth()
  return (
    <>
    <div>
      <label htmlFor='my-drawer-2' className="btn btn-ghost drawer-button lg:hidden absolute left-5">
        <AiOutlineMenuUnfold className="text-white" />
      </label>
    </div><div className="flex items-center justify-center">
                <img
                  src={logo}
                  alt="NexChat"
                  className="w-32 h-30 object-contain"
                />
              </div>
      <div className="flex h-screen  items-center justify-center">
        <h1 className="text-center">
          WellCome <span className="font-semibold text-xl">{authUser.user.fullname}</span>
          <br />
            
          No chat selected,please start conversation by selecting any one to your contacts
        </h1>
      </div>
    </>
  )

}
