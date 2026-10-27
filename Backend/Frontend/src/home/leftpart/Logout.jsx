import { FiLogOut, FiSettings } from "react-icons/fi";
import React, { useState } from 'react'
import Cookies from "js-cookie"
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../../context/Authprovider.jsx";
import useGameStore from '../../zustand/useGameStore.js';
import { IoArrowBack, IoGameControllerOutline } from "react-icons/io5";
import PixelAvatar from "../../components/PixelAvatar";
import UserSettingsModal from "../../components/UserSettingsModal";

function Logout() {
    const [loading, setLoading] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [authUser] = useAuth();
    const { openGameCenter } = useGameStore();

    const handleLogout = async () => {
        setLoading(true);
        try {
            await axios.post("/api/user/logout");
            localStorage.removeItem("chatapp");
            Cookies.remove("jwt");
            setLoading(false);
            toast.success("Logged out successfully");
            window.location.reload();
        } catch (error) {
            console.log("Error in logout", error);
            toast.error("Error in logout");
            setLoading(false);
        }
    };
    
    const handlePlayGames = () => {
        openGameCenter();
    };

    return (
        <>
            <div className="min-h-16 h-16 pb-safe bg-[#1A1D29] border-t border-gray-800 px-3 md:px-4 flex items-center justify-between shrink-0 shadow-sm z-10">
                {/* User avatar & info (clickable to open settings) */}
                <div
                    onClick={() => setIsSettingsOpen(true)}
                    className="flex items-center gap-2.5 min-w-0 cursor-pointer p-1.5 -ml-1 rounded-xl hover:bg-white/[0.04] transition-colors"
                    title="Open Settings"
                >
                    <PixelAvatar
                        avatar={authUser?.user?.avatar}
                        name={authUser?.user?.fullname || "Me"}
                        size={38}
                        isOnline={true}
                    />
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-200 truncate leading-tight">
                            {authUser?.user?.fullname || "My Account"}
                        </p>
                        <span className="text-[11px] text-indigo-400 font-medium">
                            {authUser?.user?.bio ? (
                                <span className="truncate block max-w-[120px] text-gray-400">{authUser.user.bio}</span>
                            ) : (
                                "You"
                            )}
                        </span>
                    </div>
                </div>

                {/* Action buttons: Settings & Logout */}
                <div className="flex items-center gap-1">
                      <button
                                            onClick={handlePlayGames}
                                            className="p-2 rounded-xl text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 active:scale-95 transition-all cursor-pointer"
                                            title="Game Arcade (Tic-Tac-Toe, Connect 4)"
                                            aria-label="Play Games"
                                        >
                                            <IoGameControllerOutline className="text-xl" />
                                        </button>
                    
                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        title="User Settings"
                        aria-label="User Settings"
                        className="p-2 rounded-xl text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 active:scale-95 transition-all cursor-pointer"
                    >
                        <FiSettings className="text-lg" />
                    </button>

                    <button
                        onClick={handleLogout}
                        disabled={loading}
                        title="Log out"
                        aria-label="Log out"
                        className="p-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 active:scale-95 transition-all cursor-pointer"
                    >
                        <FiLogOut className="text-lg" />
                    </button>
                </div>
            </div>

            {/* User Settings Modal */}
            <UserSettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
            />
        </>
    );
}

export default Logout;