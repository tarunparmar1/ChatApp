import React from 'react'
import Messege from './messege'
import Loading from '../../components/Loading'
import useGetMessage from '../../context/useGetMessage'
import User from '../leftpart/User'
import useConversation from "../../zustand/userConversation.js"

function Messeges() {
    const {loading,messages} =useGetMessage();
     const {selectedConversation} = useConversation();

    return (
        <div className="h-[84vh] overflow-y-auto flex flex-col-reverse hide-scrollbar">
         {loading? (<Loading />):(messages.length > 0 && messages.map((message) =>(
            <Messege key={message._id} message={message} />
         ))
         )}

         {!loading && messages.length ===0 && (
            <div>
                <p className="text-center mb-[50%] mt-[10%]">
                    Say! hi to   {selectedConversation.fullname}
                </p>
          </div>
         )}
        </div>
    )
}


export default Messeges