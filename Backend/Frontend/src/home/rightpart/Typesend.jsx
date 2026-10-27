import React, { useState } from 'react'
import { IoMdSend } from "react-icons/io";
import useSendMessage from '../../context/useSendMessage.js';

function Typesend() {
    const [message, setMessage] = useState("");
    const { loading, sendMessages } = useSendMessage();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim() || loading) return;
        await sendMessages(message);
        setMessage("");
    };

    return (
        <form onSubmit={handleSubmit} className="shrink-0 bg-[#1A1D29] border-t border-gray-800 px-3 md:px-6 py-2.5 pb-safe">
            <div className="flex items-center gap-2 max-w-4xl mx-auto">
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-1 rounded-xl bg-[#252836] border border-gray-700/60 px-4 py-2.5 text-sm md:text-base text-gray-200 placeholder-gray-400 focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <button
                    type="submit"
                    disabled={loading || !message.trim()}
                    className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${
                        message.trim() && !loading
                            ? "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md active:scale-95 cursor-pointer"
                            : "bg-gray-800 text-gray-500 cursor-not-allowed opacity-60"
                    }`}
                    title="Send message"
                    aria-label="Send message"
                >
                    <IoMdSend className="text-xl" />
                </button>
            </div>
        </form>
    );
}

export default Typesend;