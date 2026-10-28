import React from 'react';
import useGameStore from '../zustand/useGameStore';
import useConversation from '../zustand/userConversation';
import { useSocketContext } from '../context/SocketContext';
import { useAuth } from '../context/Authprovider';
import PixelAvatar from './PixelAvatar';
import { GiTank } from "react-icons/gi";

import toast from 'react-hot-toast';
import {
    FiX,
    FiCpu,
    FiUserCheck,
    FiZap
} from 'react-icons/fi';
import { IoGameControllerOutline } from 'react-icons/io5';

function GameCenterModal() {
    const { isGameCenterOpen, closeGameCenter, startBotGame } = useGameStore();
    const { selectedConversation } = useConversation();
    const { onlineUsers, socket } = useSocketContext();
    const [authUser] = useAuth();

    if (!isGameCenterOpen) return null;

    const isContactOnline = selectedConversation && onlineUsers.includes(selectedConversation._id);

    const getGameTitle = (gameType) => {
        if (gameType === 'tankduel') return 'Tank Duel';
        if (gameType === 'connect4') return 'Connect 4';
        return 'Tic-Tac-Toe';
    };

    const handleChallengeFriend = (gameType) => {
        const title = getGameTitle(gameType);
        if (!selectedConversation) {
            toast(`Select a contact to challenge, or play vs Bot! Starting Bot mode...`, { icon: "🤖" });
            startBotGame(gameType, { fullname: "NexBot AI" });
            return;
        }

        if (isContactOnline && socket) {
            socket.emit("sendGameInvite", {
                to: selectedConversation._id,
                from: authUser?.user,
                gameType,
            });
            toast(`Challenge for ${title} sent to ${selectedConversation.fullname}!`, {
                icon: "🎮",
            });
            closeGameCenter();
        } else {
            startBotGame(gameType, { fullname: `${selectedConversation.fullname} (Bot)` });
            toast(`${selectedConversation.fullname} is offline. Starting ${title} in Bot mode!`, {
                icon: <FiCpu />,
            });
        }
    };

    const handlePlayBot = (gameType) => {
        startBotGame(gameType, { fullname: "NexBot AI" });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-sm animate-fade-in select-none">
            <div
                className="bg-[#1A1D29] border border-gray-800 w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800 bg-[#12141C]/80 shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-md">
                            <IoGameControllerOutline className="text-xl" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-white leading-tight">
                                Game Arcade Hub
                            </h3>
                            <p className="text-xs text-gray-400">
                                Real-time 2-player battles and solo AI arcade games
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={closeGameCenter}
                        className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
                        title="Close"
                    >
                        <FiX className="text-xl" />
                    </button>
                </div>

                {/* Partner Context Bar */}
                {selectedConversation && (
                    <div className="px-5 py-2.5 bg-[#161823] border-b border-gray-800/80 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2 min-w-0">
                            <PixelAvatar
                                avatar={selectedConversation.avatar}
                                name={selectedConversation.fullname}
                                size={28}
                                isOnline={isContactOnline}
                            />
                            <p className="text-xs text-gray-300 truncate">
                                Partner: <strong className="text-white">{selectedConversation.fullname}</strong>
                            </p>
                        </div>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${isContactOnline ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-800 text-gray-400'}`}>
                            {isContactOnline ? '● Online' : 'Offline'}
                        </span>
                    </div>
                )}

                {/* Games Selection List (Scrollable) */}
                <div className="p-5 space-y-4 overflow-y-auto hide-scrollbar">
                    {/* Game 1: Tank Duel 8-Bit */}
                    <div className="p-4 rounded-2xl bg-[#12141C] border border-amber-500/40 hover:border-amber-400 transition-all group shadow-md shadow-amber-500/5">
                        <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500/20 to-red-500/20 border border-amber-500/30 flex items-center justify-center text-2xl font-black">
                                   <GiTank />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                                            Tank Duel (8-Bit Battlefield)
                                        </h4>
                                        <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded bg-amber-500 text-black">
                                            NEW & HOT
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        Drive tanks, shoot cannons, blast brick walls, and grab power-ups!
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                            {selectedConversation && (
                                <button
                                    type="button"
                                    onClick={() => handleChallengeFriend('tankduel')}
                                    className="flex-1 py-2 px-3 rounded-xl bg-[#8b5cf6] hover:from-amber-600 hover:to-red-700 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                                >
                                    <FiZap /> Play Tank Duel vs {selectedConversation?.fullname ? selectedConversation.fullname.split(' ')[0] : 'Friend'}
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => handlePlayBot('tankduel')}
                                className="py-2 px-3 rounded-xl bg-red-700 hover:bg-[#2d3142] text-gray-300 text-xs font-semibold transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                                title="Play vs Bot"
                            >
                                <FiCpu className="text-amber-400" /> vs Bot
                            </button>
                        </div>
                    </div>

                    {/* Game 2: Connect 4 */}
                    <div className="p-4 rounded-2xl bg-[#12141C] border border-gray-800 hover:border-rose-500/50 transition-all group">
                        <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-lg font-black text-rose-400">
                                    🔴<br></br>🟡
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white group-hover:text-rose-400 transition-colors">
                                        Connect 4 (Four-in-a-Row)
                                    </h4>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        Drop tokens into 7 columns. Connect 4 in a row to win!
                                    </p>
                                </div>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300">
                                Popular
                            </span>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                            {selectedConversation && (
                                <button
                                    type="button"
                                    onClick={() => handleChallengeFriend('connect4')}
                                    className="flex-1 py-2 px-3 rounded-xl bg-[#8b5cf6] hover:from-rose-600 hover:to-amber-600 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                                >
                                    <FiZap /> Challenge {selectedConversation?.fullname ? selectedConversation.fullname.split(' ')[0] : 'Friend'}
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => handlePlayBot('connect4')}
                                className="py-2 px-3 rounded-xl bg-red-700 hover:bg-[#2d3142] text-gray-300 text-xs font-semibold transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                                title="Play vs Bot"
                            >
                                <FiCpu className="text-rose-400" /> vs Bot
                            </button>
                        </div>
                    </div>

                    {/* Game 3: Tic-Tac-Toe */}
                    <div className="p-4 rounded-2xl bg-[#12141C] border border-gray-800 hover:border-indigo-500/50 transition-all group">
                        <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-2xl font-black text-indigo-400">
                                    ✕◯
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">
                                        Tic-Tac-Toe
                                    </h4>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        Classic 3x3 strategic duel. Quick and competitive.
                                    </p>
                                </div>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300">
                                Classic
                            </span>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                            {selectedConversation && (
                                <button
                                    type="button"
                                    onClick={() => handleChallengeFriend('tictactoe')}
                                    className="flex-1 py-2 px-3 rounded-xl bg-[#8b5cf6] hover:bg-indigo-600 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                                >
                                    <FiUserCheck /> Challenge {selectedConversation?.fullname ? selectedConversation.fullname.split(' ')[0] : 'Friend'}
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => handlePlayBot('tictactoe')}
                                className="py-2 px-3 rounded-xl bg-red-700 hover:bg-[#2d3142] text-gray-300 text-xs font-semibold transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                                title="Play vs Bot"
                            >
                                <FiCpu className="text-indigo-400" /> vs Bot
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer note */}
                <div className="px-5 py-3 border-t border-gray-800 bg-[#12141C]/80 text-center text-xs text-gray-500 shrink-0">
                    All games support live 2-player multiplayer or single-player vs AI bots.
                </div>
            </div>
        </div>
    );
}

export default GameCenterModal;
