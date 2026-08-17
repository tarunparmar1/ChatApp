import React, { useState } from 'react'
import useConversation from '../zustand/userConversation.js'
import axios from 'axios'
import Loading from "../components/Loading"

function useSendMessage() {
    const [loading, setLoading] = useState(false);

    const { selectedConversation, setMessage } = useConversation();

    const sendMessages = async (message) => {
        setLoading(true);

        try {
            const res = await axios.post(
                `/api/message/send/${selectedConversation._id}`,
                { message },
                {
                    withCredentials: true
                }
            );

            // Get latest messages from Zustand
            const currentMessages = useConversation.getState().messages;

            setMessage([
                ...currentMessages,
                res.data
            ]);

        } catch (error) {
            console.log("Error in send message:", error);
        } finally {
            setLoading(false);
        }
    };

    return { loading, sendMessages };
}

export default useSendMessage;