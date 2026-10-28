import React, { useState } from 'react';
import useConversation from "../../zustand/userConversation.js";
import { useSocketContext } from '../../context/SocketContext.jsx';
import { useAuth } from '../../context/Authprovider.jsx';
import useGameStore from '../../zustand/useGameStore.js';
import { IoArrowBack, IoGameControllerOutline } from "react-icons/io5";
import { FiTrash2 } from "react-icons/fi";
import PixelAvatar from '../../components/PixelAvatar';
import axios from 'axios';
import toast from 'react-hot-toast';

function Chatuser() {
    const { selectedConversation, setSelectedConversation, setMessage } = useConversation();
    const { onlineUsers } = useSocketContext();
    const [authUser] = useAuth();
    const { openGameCenter } = useGameStore();

    const isOnline = onlineUsers.includes(selectedConversation?._id);

    const [showConfirm, setShowConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteChat = async () => {
        if (!selectedConversation?._id) return;
        setIsDeleting(true);
        try {
            await axios.delete(`/api/message/delete/${selectedConversation._id}`);
            setMessage([]);
            toast.success("Chat deleted successfully");
            setShowConfirm(false);
        } catch (error) {
            console.error("Error deleting chat:", error);
            toast.error(error.response?.data?.error || "Failed to delete chat");
        } finally {
            setIsDeleting(false);
        }
    };

    const handlePlayGames = () => {
        if (!selectedConversation) return;
        openGameCenter();
    };

    return (
        <>
            <div className="flex items-center justify-between bg-[#1A1D29] h-16 border-b border-gray-800 px-3 md:px-5 shrink-0 shadow-sm">
                <div className="flex items-center gap-3 min-w-0">
                    {/* Back button visible only on mobile screens (<md) */}
                    <button
                        onClick={() => setSelectedConversation(null)}
                        className="md:hidden p-2 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800 active:scale-95 transition-all cursor-pointer -ml-1 flex items-center justify-center"
                        title="Back to contacts"
                        aria-label="Back to contacts"
                    >
                        <IoArrowBack className="text-xl" />
                    </button>

                    {/* Pixel Avatar with online ring */}
                    <PixelAvatar
                        avatar={selectedConversation?.avatar}
                        name={selectedConversation?.fullname || "?"}
                        size={42}
                        isOnline={isOnline}
                    />

                    {/* User info */}
                    <div className="text-white min-w-0">
                        <h1 className="text-sm md:text-base font-semibold leading-tight truncate">
                            {selectedConversation?.fullname || "Select a user"}
                        </h1>
                        <span style={{
                            fontSize: '0.72rem',
                            color: isOnline ? '#4ade80' : '#9ca3af',
                            fontWeight: isOnline ? 600 : 400,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                        }}>
                            <span style={{
                                display: 'inline-block',
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                backgroundColor: isOnline ? '#4ade80' : '#6b7280',
                            }}></span>
                            {isOnline ? 'Online' : 'Offline'}
                        </span>
                    </div>
                </div>

                {/* Right side actions: Play Games Arcade & Delete Chat */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={handlePlayGames}
                        className="p-2 rounded-xl text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 active:scale-95 transition-all cursor-pointer"
                        title="Game Arcade (Tic-Tac-Toe, Connect 4)"
                        aria-label="Play Games"
                    >
                        <IoGameControllerOutline className="text-xl" />
                    </button>

                    {/* <button
                        onClick={() => setShowConfirm(true)}
                        className="p-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 active:scale-95 transition-all cursor-pointer"
                        title="Delete chat history"
                        aria-label="Delete chat"
                    >
                        <FiTrash2 className="text-lg" />
                    </button> */}
                </div>
            </div>

            {/* Delete Chat Confirmation Modal */}
            {/* {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
                    <div className="bg-[#1A1D29] border border-gray-800 max-w-sm w-full p-5 rounded-2xl shadow-2xl space-y-4 animate-fade-in">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-full bg-red-500/10 text-red-400">
                                <FiTrash2 className="text-xl" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-white">Delete Chat?</h4>
                                <p className="text-xs text-gray-400">With {selectedConversation?.fullname}</p>
                            </div>
                        </div>
                        <p className="text-xs text-gray-300 leading-relaxed">
                            Are you sure you want to clear this entire conversation? All messages will be permanently removed.
                        </p>
                        <div className="flex items-center justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowConfirm(false)}
                                className="px-3.5 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={isDeleting}
                                onClick={handleDeleteChat}
                                className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer"
                            >
                                {isDeleting ? "Deleting..." : "Delete Chat"}
                            </button>
                        </div>
                    </div>
                </div>
            )} */}
        </>
    );
}

export default Chatuser;