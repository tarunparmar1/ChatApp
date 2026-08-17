import React, { useState } from 'react'
import { IoMdSend } from "react-icons/io";
import useSendMessage from '../../context/useSendMessage.js';

function Typesend() {
    const [message, setMassage] = useState("")
    const {loading, sendMessages} = useSendMessage();
    const handelSubmit = async(e)=>{
        e.preventDefault();
          if (!message.trim()) return;
        await sendMessages(message)
       setMassage("")
    };
    return (
        <form onSubmit={handelSubmit}>
            <div className=" flex space-x-2 h-[8vh] txet-center bg-[#1A1D29] items-center justify-center px-2 border-[1px] border-gray-800">
            <div className="w-[70%]">
                <input type="text" placeholder="Type here" value={message} onChange={(e) => setMassage(e.target.value)}  className="input input-borderd w-full " />


            </div>
            <div>
                <button  type="submit" disabled={loading}>
                     <IoMdSend className="text-3xl" />
                </button>
            </div>
        </div>

        </form>
    )
}
export default Typesend