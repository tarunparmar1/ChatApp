import React, { useEffect, useRef } from 'react'
import Messege from './messege'
import Loading from '../../components/Loading'
import useGetMessage from '../../context/useGetMessage'
import User from '../leftpart/User'
import useConversation from "../../zustand/userConversation.js"

function Messeges() {
    const { loading, messages } = useGetMessage();
    const { selectedConversation } = useConversation();

    const lastMsgRef = useRef();
    useEffect(() => {
        setTimeout(() => {
            if (lastMsgRef.current) {
                lastMsgRef.current.scrollIntoView({ behavior: "smooth" })
            }
        }, 100);

    }, [messages]);

    return (
        <div className="h-[84vh] overflow-y-auto flex flex-col hide-scrollbar">
            {loading ? (<Loading />) : (messages.map((message, index) => (
                <div
                    key={message?._id || index}
                    ref={index === messages.length - 1 ? lastMsgRef : null}
                >
                    <Messege message={message} />
                </div>
            ))
            )}

            {!loading && messages.length === 0 && (
                <div>
                    <p className="text-center mb-[50%] mt-[10%]">
                        Say! hi to  {selectedConversation?.fullname || "Select a user"}
                    </p>
                </div>
            )}
        </div>
    )
}


export default Messeges