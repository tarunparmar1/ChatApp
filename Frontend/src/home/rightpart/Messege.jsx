import React from 'react'

function Messege() {
    return (
        <div>
            <div>
                <div className="chat chat-end">
                    <div className="chat-bubble bg-[#3F4EC2] text-white">
                        My message
                    </div>
                </div>

                <div className="chat chat-start">
                    <div className="chat-bubble bg-gray-700 text-white">
                        Other person's message
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Messege