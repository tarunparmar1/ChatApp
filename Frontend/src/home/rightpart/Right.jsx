import React, { useEffect } from 'react'
import Chatuser from './Chatuser'
import Messeges from './Messeges'
import Typesend from './Typesend'
import useConversation from '../../zustand/userConversation'
import {useAuth} from "../../context/Authprovider.jsx"

export function Right() {
  const { selectedConversation, setSelectedConversation } = useConversation()
  useEffect(() => {
    return setSelectedConversation(null)
  }, [setSelectedConversation]);
  return (
      <div className=" w-[70%] border border-black bg-[#12141C]">
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
