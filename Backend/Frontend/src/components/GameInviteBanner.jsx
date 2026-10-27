import React from 'react';
import useGameStore from '../zustand/useGameStore';
import { useSocketContext } from '../context/SocketContext';
import { useAuth } from '../context/Authprovider';
import PixelAvatar from './PixelAvatar';
import { IoGameControllerOutline } from 'react-icons/io5';
import { FiCheck, FiX } from 'react-icons/fi';

function GameInviteBanner() {
    const { incomingInvite, setIncomingInvite, startOnlineGame } = useGameStore();
    const { socket } = useSocketContext();
    const [authUser] = useAuth();

    if (!incomingInvite) return null;

    const fromUser = incomingInvite.from || incomingInvite;
    const gameType = incomingInvite.gameType || 'tictactoe';
    const gameName = gameType === 'cricket' ? 'Cricket Clash' : gameType === 'tankduel' ? 'Tank Duel 8-Bit' : gameType === 'connect4' ? 'Connect 4' : 'Tic-Tac-Toe';

    const handleAccept = () => {
        if (!socket || !fromUser?._id) return;
        socket.emit("acceptGameInvite", {
            to: fromUser._id,
            from: authUser?.user,
            gameType,
        });
        const symbol = gameType === 'cricket' ? 'bowl' : gameType === 'tankduel' ? 'p2' : gameType === 'connect4' ? 'yellow' : 'O';
        startOnlineGame(gameType, fromUser, symbol);
    };

    const handleDecline = () => {
        if (socket && fromUser?._id) {
            socket.emit("declineGameInvite", { to: fromUser._id });
        }
        setIncomingInvite(null);
    };

    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-60 w-[92%] max-w-md animate-bounce-short">
            <div className="bg-[#1A1D29]/95 backdrop-blur-md border border-indigo-500/40 rounded-2xl p-3.5 shadow-2xl shadow-indigo-500/20 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                        <PixelAvatar
                            avatar={fromUser.avatar}
                            name={fromUser.fullname}
                            size={40}
                            isOnline={true}
                        />
                        <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-indigo-600 text-white text-[10px]">
                            <IoGameControllerOutline />
                        </div>
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs md:text-sm font-bold text-white truncate">
                            {fromUser.fullname}
                        </p>
                        <p className="text-[11px] text-indigo-300 truncate">
                            Challenged you to <strong className="text-white">{gameName}</strong>!
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <button
                        type="button"
                        onClick={handleAccept}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                    >
                        <FiCheck className="text-sm" /> Accept
                    </button>
                    <button
                        type="button"
                        onClick={handleDecline}
                        className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
                        title="Decline"
                    >
                        <FiX className="text-base" />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default GameInviteBanner;
