import React, { useEffect, useRef } from 'react'
import Messege from './Messege.jsx'
import Loading from '../../components/Loading'
import useGetMessage from '../../context/useGetMessage'
import useConversation from "../../zustand/userConversation.js"
import useSocketGetMessage from '../../context/useSocketGetMessage.js'

function Messeges() {
    const { loading, messages } = useGetMessage();
    const { selectedConversation } = useConversation();
    useSocketGetMessage(); // listen for incoming messages

    const lastMsgRef = useRef();

    useEffect(() => {
        const timer = setTimeout(() => {
            if (lastMsgRef.current) {
                lastMsgRef.current.scrollIntoView({ behavior: "smooth" });
            }
        }, 100);
        return () => clearTimeout(timer);
    }, [messages]);

    return (
        <div className="flex-1 overflow-y-auto px-3 md:px-6 py-4 flex flex-col hide-scrollbar space-y-2">
            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <Loading />
                </div>
            ) : (
                messages.map((message, index) => (
                    <div
                        key={message?._id || index}
                        ref={index === messages.length - 1 ? lastMsgRef : null}
                    >
                        <Messege message={message} />
                    </div>
                ))
            )}

            {!loading && messages.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 my-auto">
                  
                    <p className="text-gray-300 font-medium text-sm md:text-base">
                        Say hi to <span className="text-white font-semibold">{selectedConversation?.fullname || "user"}</span>!
                    </p>
                    <span className="text-xs text-gray-500 mt-1 max-w-xs">
                        Start the conversation by typing your first message below.
                    </span>
                </div>
            )}
        </div>
    );
}

export default Messeges;