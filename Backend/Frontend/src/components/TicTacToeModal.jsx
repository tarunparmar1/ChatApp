import React, { useState, useEffect, useCallback } from 'react';
import { useSocketContext } from '../context/SocketContext';
import { useAuth } from '../context/Authprovider';
import useGameStore from '../zustand/useGameStore';
import PixelAvatar from './PixelAvatar';
import { RiRobot3Fill } from "react-icons/ri";
import toast from 'react-hot-toast';
import {
    FiX,
    FiRefreshCw,
    FiUser,
    FiCpu,
    FiAward,
    FiCheckCircle
} from 'react-icons/fi';
import { IoGameControllerOutline } from 'react-icons/io5';

const WINNING_LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
    [0, 4, 8], [2, 4, 6]             // diagonals
];

function checkWinner(board) {
    for (let line of WINNING_LINES) {
        const [a, b, c] = line;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return { winner: board[a], line };
        }
    }
    if (board.every((cell) => cell !== null)) {
        return { winner: 'draw', line: [] };
    }
    return null;
}

function TicTacToeModal() {
    const { activeGame, gameMode, opponent, mySymbol, closeGame, startBotGame } = useGameStore();
    const { socket } = useSocketContext();
    const [authUser] = useAuth();

    const [board, setBoard] = useState(Array(9).fill(null));
    const [turn, setTurn] = useState('X');
    const [winningInfo, setWinningInfo] = useState(null);
    const [scores, setScores] = useState({ player: 0, opponent: 0, draws: 0 });

    const isMyTurn = (gameMode === 'bot' && turn === mySymbol) || (gameMode === 'online' && turn === mySymbol);

    // Reset current round
    const handleResetRound = useCallback((notify = true) => {
        setBoard(Array(9).fill(null));
        setTurn('X');
        setWinningInfo(null);
        if (notify && gameMode === 'online' && socket && opponent?._id) {
            socket.emit("restartGame", { to: opponent._id });
        }
    }, [gameMode, socket, opponent]);

    // Handle game move
    const makeMove = useCallback((index, symbol, fromOpponent = false) => {
        setBoard((prev) => {
            if (prev[index] || winningInfo) return prev;
            const next = [...prev];
            next[index] = symbol;

            const res = checkWinner(next);
            if (res) {
                setWinningInfo(res);
                if (res.winner === 'draw') {
                    setScores((s) => ({ ...s, draws: s.draws + 1 }));
                } else if (res.winner === mySymbol) {
                    setScores((s) => ({ ...s, player: s.player + 1 }));
                } else {
                    setScores((s) => ({ ...s, opponent: s.opponent + 1 }));
                }
            }
            return next;
        });

        const nextTurn = symbol === 'X' ? 'O' : 'X';
        setTurn(nextTurn);

        // If move was made by local player in online mode, notify opponent via socket
        if (!fromOpponent && gameMode === 'online' && socket && opponent?._id) {
            socket.emit("makeGameMove", {
                to: opponent._id,
                index,
                symbol,
                nextTurn,
            });
        }
    }, [winningInfo, mySymbol, gameMode, socket, opponent]);

    // Handle user clicking on a board cell
    const handleCellClick = (index) => {
        if (!isMyTurn || board[index] || winningInfo) return;
        makeMove(index, mySymbol, false);
    };

    // Bot AI move logic
    useEffect(() => {
        if (gameMode !== 'bot' || turn === mySymbol || winningInfo) return;

        const botSymbol = mySymbol === 'X' ? 'O' : 'X';
        const timer = setTimeout(() => {
            // Find best bot move:
            // 1. Check if bot can win in 1 move
            for (let i = 0; i < 9; i++) {
                if (!board[i]) {
                    const testBoard = [...board];
                    testBoard[i] = botSymbol;
                    if (checkWinner(testBoard)?.winner === botSymbol) {
                        makeMove(i, botSymbol, true);
                        return;
                    }
                }
            }
            // 2. Block player if player can win in 1 move
            for (let i = 0; i < 9; i++) {
                if (!board[i]) {
                    const testBoard = [...board];
                    testBoard[i] = mySymbol;
                    if (checkWinner(testBoard)?.winner === mySymbol) {
                        makeMove(i, botSymbol, true);
                        return;
                    }
                }
            }
            // 3. Take center if available
            if (!board[4]) {
                makeMove(4, botSymbol, true);
                return;
            }
            // 4. Take corners
            const corners = [0, 2, 6, 8].filter((idx) => !board[idx]);
            if (corners.length > 0) {
                const pick = corners[Math.floor(Math.random() * corners.length)];
                makeMove(pick, botSymbol, true);
                return;
            }
            // 5. Any open cell
            const openIndices = board.map((c, i) => (c === null ? i : null)).filter((i) => i !== null);
            if (openIndices.length > 0) {
                const pick = openIndices[Math.floor(Math.random() * openIndices.length)];
                makeMove(pick, botSymbol, true);
            }
        }, 450);

        return () => clearTimeout(timer);
    }, [gameMode, turn, mySymbol, board, winningInfo, makeMove]);

    // Listen to incoming socket game events in online mode
    useEffect(() => {
        if (!socket || gameMode !== 'online') return;

        const onGameMove = ({ index, symbol }) => {
            makeMove(index, symbol, true);
        };

        const onGameRestart = () => {
            handleResetRound(false);
            toast("Round restarted by opponent", { icon: "🔄" });
        };

        const onGameEnded = () => {
            toast("Opponent left the game", { icon: "👋" });
            startBotGame({ fullname: "NexBot AI" });
        };

        socket.on("gameMoveReceived", onGameMove);
        socket.on("gameRestarted", onGameRestart);
        socket.on("gameEnded", onGameEnded);

        return () => {
            socket.off("gameMoveReceived", onGameMove);
            socket.off("gameRestarted", onGameRestart);
            socket.off("gameEnded", onGameEnded);
        };
    }, [socket, gameMode, makeMove, handleResetRound, startBotGame]);

    // Close and inform opponent if in online mode
    const handleClose = () => {
        if (gameMode === 'online' && socket && opponent?._id) {
            socket.emit("leaveGame", { to: opponent._id });
        }
        closeGame();
    };

    if (activeGame !== 'tictactoe') return null;

    const otherSymbol = mySymbol === 'X' ? 'O' : 'X';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-sm animate-fade-in select-none">
            <div
                className="bg-[#1A1D29] border border-gray-800 w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-800 bg-[#12141C]/80 shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                            <IoGameControllerOutline className="text-xl" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-white leading-tight">
                                Tic-Tac-Toe
                            </h3>
                            <span className="text-[11px] text-gray-400 flex items-center gap-1">
                                {gameMode === 'online' ? (
                                    <>
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Online Match vs {opponent?.fullname || "Player"}
                                    </>
                                ) : (
                                    <>
                                        <FiCpu className="text-indigo-400" /> Playing vs NexBot AI
                                    </>
                                )}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={handleClose}
                        className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
                        title="Close game"
                    >
                        <FiX className="text-xl" />
                    </button>
                </div>

                {/* Scoreboard */}
                <div className="px-5 py-3 bg-[#161823] border-b border-gray-800/80 flex items-center justify-between">
                    {/* Player */}
                    <div className={`flex items-center gap-2.5 p-2 rounded-xl transition-all ${turn === mySymbol && !winningInfo ? 'bg-indigo-500/15 ring-1 ring-indigo-500/50' : ''}`}>
                        <PixelAvatar
                            avatar={authUser?.user?.avatar}
                            name={authUser?.user?.fullname || "You"}
                            size={34}
                            isOnline={true}
                        />
                        <div>
                            <p className="text-xs font-bold text-white truncate max-w-[80px]">
                                {authUser?.user?.fullname || "You"}
                            </p>
                            <span className="text-[11px] font-black text-indigo-400">
                                {mySymbol} ({scores.player})
                            </span>
                        </div>
                    </div>

                    {/* Draws */}
                    <div className="text-center px-2">
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold block">Draws</span>
                        <span className="text-xs font-bold text-gray-300">{scores.draws}</span>
                    </div>

                    {/* Opponent */}
                    <div className={`flex items-center gap-2.5 p-2 rounded-xl transition-all ${turn === otherSymbol && !winningInfo ? 'bg-purple-500/15 ring-1 ring-purple-500/50' : ''}`}>
                        <div className="text-right">
                            <p className="text-xs font-bold text-white truncate max-w-[80px]">
                                {opponent?.fullname || "Opponent"}
                            </p>
                            <span className="text-[11px] font-black text-purple-400">
                                {otherSymbol} ({scores.opponent})
                            </span>
                        </div>
                        {gameMode === 'bot' ? (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                                <RiRobot3Fill />
                            </div>
                        ) : (
                            <PixelAvatar
                                avatar={opponent?.avatar}
                                name={opponent?.fullname || "Opponent"}
                                size={34}
                                isOnline={true}
                            />
                        )}
                    </div>
                </div>

                {/* Turn / Result Status Banner */}
                <div className="px-5 py-2.5 bg-[#12141C] border-b border-gray-800/60 text-center">
                    {!winningInfo ? (
                        <p className="text-xs font-semibold text-gray-300">
                            {isMyTurn ? (
                                <span className="text-indigo-400 animate-pulse font-bold">
                                    👉 Your Turn! Place ({mySymbol})
                                </span>
                            ) : (
                                <span className="text-purple-400 font-medium">
                                    Waiting for {opponent?.fullname || "Opponent"} ({otherSymbol})...
                                </span>
                            )}
                        </p>
                    ) : winningInfo.winner === 'draw' ? (
                        <p className="text-xs font-bold text-amber-400 flex items-center justify-center gap-1">
                            🤝 It's a Draw! Well played.
                        </p>
                    ) : winningInfo.winner === mySymbol ? (
                        <p className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1 animate-bounce">
                            <FiAward className="text-base" /> Victory! You won this round! 🎉
                        </p>
                    ) : (
                        <p className="text-xs font-bold text-red-400 flex items-center justify-center gap-1">
                            {opponent?.fullname || "Opponent"} won this round!
                        </p>
                    )}
                </div>

                {/* 3x3 Tic-Tac-Toe Board */}
                <div className="p-6 flex items-center justify-center bg-[#1A1D29]">
                    <div className="grid grid-cols-3 gap-3 w-64 h-64 sm:w-72 sm:h-72">
                        {board.map((val, idx) => {
                            const isWinCell = winningInfo?.line?.includes(idx);
                            return (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleCellClick(idx)}
                                    disabled={!isMyTurn || val !== null || Boolean(winningInfo)}
                                    className={`rounded-2xl flex items-center justify-center text-4xl sm:text-5xl font-black transition-all select-none ${
                                        val === null && isMyTurn && !winningInfo
                                            ? 'bg-[#252836] hover:bg-[#2d3142] active:scale-95 cursor-pointer shadow-sm hover:shadow-indigo-500/10'
                                            : 'bg-[#212433] cursor-default'
                                    } ${
                                        isWinCell
                                            ? 'bg-gradient-to-br from-indigo-600/40 to-purple-600/40 border-2 border-indigo-400 shadow-lg shadow-indigo-500/30 scale-105'
                                            : 'border border-gray-800'
                                    }`}
                                >
                                    {val === 'X' && (
                                        <span className="text-transparent bg-clip-text bg-gradient-to-tr from-cyan-400 to-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]">
                                            X
                                        </span>
                                    )}
                                    {val === 'O' && (
                                        <span className="text-transparent bg-clip-text bg-gradient-to-tr from-pink-400 to-purple-400 drop-shadow-[0_0_8px_rgba(236,72,153,0.5)]">
                                            O
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="px-5 py-3 border-t border-gray-800 bg-[#12141C]/80 flex items-center justify-between shrink-0">
                    <button
                        type="button"
                        onClick={() => handleResetRound(true)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold cursor-pointer transition-all active:scale-95"
                    >
                        <FiRefreshCw className="text-indigo-400" /> Play Again
                    </button>

                    {gameMode === 'online' ? (
                        <button
                            type="button"
                            onClick={() => startBotGame({ fullname: "NexBot AI" })}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-gray-400 hover:text-indigo-300 text-xs font-medium transition-colors cursor-pointer"
                        >
                            <FiCpu /> Play vs Bot
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setScores({ player: 0, opponent: 0, draws: 0 })}
                            className="text-gray-400 hover:text-gray-300 text-xs font-medium cursor-pointer"
                        >
                            Reset Scores
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default TicTacToeModal;
