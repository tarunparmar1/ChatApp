import React, { useState, useEffect, useCallback } from 'react';
import { useSocketContext } from '../context/SocketContext';
import { useAuth } from '../context/Authprovider';
import useGameStore from '../zustand/useGameStore';
import PixelAvatar from './PixelAvatar';
import toast from 'react-hot-toast';
import {
    FiX,
    FiRefreshCw,
    FiCpu,
    FiAward,
} from 'react-icons/fi';
import { IoGameControllerOutline } from 'react-icons/io5';

const ROWS = 6;
const COLS = 7;

// Check for 4-in-a-row in all directions
function checkConnect4Winner(board) {
    // 1. Horizontal
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c <= COLS - 4; c++) {
            const idx = r * COLS + c;
            const piece = board[idx];
            if (piece &&
                piece === board[idx + 1] &&
                piece === board[idx + 2] &&
                piece === board[idx + 3]) {
                return { winner: piece, line: [idx, idx + 1, idx + 2, idx + 3] };
            }
        }
    }

    // 2. Vertical
    for (let r = 0; r <= ROWS - 4; r++) {
        for (let c = 0; c < COLS; c++) {
            const idx = r * COLS + c;
            const piece = board[idx];
            if (piece &&
                piece === board[idx + COLS] &&
                piece === board[idx + 2 * COLS] &&
                piece === board[idx + 3 * COLS]) {
                return { winner: piece, line: [idx, idx + COLS, idx + 2 * COLS, idx + 3 * COLS] };
            }
        }
    }

    // 3. Diagonal Down-Right
    for (let r = 0; r <= ROWS - 4; r++) {
        for (let c = 0; c <= COLS - 4; c++) {
            const idx = r * COLS + c;
            const piece = board[idx];
            if (piece &&
                piece === board[idx + COLS + 1] &&
                piece === board[idx + 2 * (COLS + 1)] &&
                piece === board[idx + 3 * (COLS + 1)]) {
                return { winner: piece, line: [idx, idx + COLS + 1, idx + 2 * (COLS + 1), idx + 3 * (COLS + 1)] };
            }
        }
    }

    // 4. Diagonal Up-Right
    for (let r = 3; r < ROWS; r++) {
        for (let c = 0; c <= COLS - 4; c++) {
            const idx = r * COLS + c;
            const piece = board[idx];
            if (piece &&
                piece === board[idx - COLS + 1] &&
                piece === board[idx - 2 * (COLS - 1)] &&
                piece === board[idx - 3 * (COLS - 1)]) {
                return { winner: piece, line: [idx, idx - COLS + 1, idx - 2 * (COLS - 1), idx - 3 * (COLS - 1)] };
            }
        }
    }

    if (board.every((cell) => cell !== null)) {
        return { winner: 'draw', line: [] };
    }

    return null;
}

// Find lowest empty row in column
function getAvailableRow(board, col) {
    for (let r = ROWS - 1; r >= 0; r--) {
        if (board[r * COLS + col] === null) {
            return r;
        }
    }
    return -1;
}

function Connect4Modal() {
    const { activeGame, gameMode, opponent, mySymbol, closeGame, startBotGame } = useGameStore();
    const { socket } = useSocketContext();
    const [authUser] = useAuth();

    // Board: 42 cells (6 rows x 7 cols)
    const [board, setBoard] = useState(Array(ROWS * COLS).fill(null));
    const [turn, setTurn] = useState('red'); // 'red' moves first, then 'yellow'
    const [hoverCol, setHoverCol] = useState(null);
    const [winningInfo, setWinningInfo] = useState(null);
    const [scores, setScores] = useState({ player: 0, opponent: 0, draws: 0 });

    // Player color mapping:
    // challenger = 'red', opponent = 'yellow'
    const myColor = mySymbol === 'O' || mySymbol === 'yellow' ? 'yellow' : 'red';
    const otherColor = myColor === 'red' ? 'yellow' : 'red';
    const isMyTurn = (gameMode === 'bot' && turn === myColor) || (gameMode === 'online' && turn === myColor);

    // Reset current round
    const handleResetRound = useCallback((notify = true) => {
        setBoard(Array(ROWS * COLS).fill(null));
        setTurn('red');
        setWinningInfo(null);
        if (notify && gameMode === 'online' && socket && opponent?._id) {
            socket.emit("restartGame", { to: opponent._id, gameType: 'connect4' });
        }
    }, [gameMode, socket, opponent]);

    // Drop token into column
    const dropPiece = useCallback((col, color, fromOpponent = false) => {
        const row = getAvailableRow(board, col);
        if (row === -1 || winningInfo) return;

        const targetIdx = row * COLS + col;
        const nextBoard = [...board];
        nextBoard[targetIdx] = color;
        setBoard(nextBoard);

        const res = checkConnect4Winner(nextBoard);
        if (res) {
            setWinningInfo(res);
            if (res.winner === 'draw') {
                setScores((s) => ({ ...s, draws: s.draws + 1 }));
            } else if (res.winner === myColor) {
                setScores((s) => ({ ...s, player: s.player + 1 }));
            } else {
                setScores((s) => ({ ...s, opponent: s.opponent + 1 }));
            }
        }

        const nextTurn = color === 'red' ? 'yellow' : 'red';
        setTurn(nextTurn);

        // Notify opponent via socket if move was made by local player in online mode
        if (!fromOpponent && gameMode === 'online' && socket && opponent?._id) {
            socket.emit("makeGameMove", {
                to: opponent._id,
                gameType: 'connect4',
                col,
                color,
                nextTurn,
            });
        }
    }, [board, winningInfo, myColor, gameMode, socket, opponent]);

    // Handle user clicking a column
    const handleColumnClick = (col) => {
        if (!isMyTurn || winningInfo) return;
        if (getAvailableRow(board, col) === -1) return;
        dropPiece(col, myColor, false);
    };

    // Bot AI move logic
    useEffect(() => {
        if (gameMode !== 'bot' || turn === myColor || winningInfo) return;

        const timer = setTimeout(() => {
            // 1. Check if bot can win in 1 move
            for (let c = 0; c < COLS; c++) {
                const r = getAvailableRow(board, c);
                if (r !== -1) {
                    const testBoard = [...board];
                    testBoard[r * COLS + c] = otherColor;
                    if (checkConnect4Winner(testBoard)?.winner === otherColor) {
                        dropPiece(c, otherColor, true);
                        return;
                    }
                }
            }

            // 2. Block player if player can win in 1 move
            for (let c = 0; c < COLS; c++) {
                const r = getAvailableRow(board, c);
                if (r !== -1) {
                    const testBoard = [...board];
                    testBoard[r * COLS + c] = myColor;
                    if (checkConnect4Winner(testBoard)?.winner === myColor) {
                        dropPiece(c, otherColor, true);
                        return;
                    }
                }
            }

            // 3. Center column preference [3, 2, 4, 1, 5, 0, 6]
            const preferredCols = [3, 2, 4, 1, 5, 0, 6];
            for (let c of preferredCols) {
                const r = getAvailableRow(board, c);
                if (r !== -1) {
                    // Check if dropping here gives the player an immediate win right above
                    if (r > 0) {
                        const testBoard = [...board];
                        testBoard[r * COLS + c] = otherColor;
                        testBoard[(r - 1) * COLS + c] = myColor;
                        if (checkConnect4Winner(testBoard)?.winner === myColor) {
                            continue; // avoid giving player win
                        }
                    }
                    dropPiece(c, otherColor, true);
                    return;
                }
            }

            // Fallback: any available column
            for (let c = 0; c < COLS; c++) {
                if (getAvailableRow(board, c) !== -1) {
                    dropPiece(c, otherColor, true);
                    return;
                }
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [gameMode, turn, myColor, otherColor, board, winningInfo, dropPiece]);

    // Socket listeners in online mode
    useEffect(() => {
        if (!socket || gameMode !== 'online') return;

        const onGameMove = (payload) => {
            if (payload?.gameType === 'connect4') {
                dropPiece(payload.col, payload.color, true);
            }
        };

        const onGameRestart = (payload) => {
            if (!payload?.gameType || payload.gameType === 'connect4') {
                handleResetRound(false);
                toast("Round restarted by opponent", { icon: "🔄" });
            }
        };

        const onGameEnded = () => {
            toast("Opponent left the game", { icon: "👋" });
            startBotGame('connect4', { fullname: "NexBot AI" }, myColor);
        };

        socket.on("gameMoveReceived", onGameMove);
        socket.on("gameRestarted", onGameRestart);
        socket.on("gameEnded", onGameEnded);

        return () => {
            socket.off("gameMoveReceived", onGameMove);
            socket.off("gameRestarted", onGameRestart);
            socket.off("gameEnded", onGameEnded);
        };
    }, [socket, gameMode, dropPiece, handleResetRound, startBotGame, myColor]);

    const handleClose = () => {
        if (gameMode === 'online' && socket && opponent?._id) {
            socket.emit("leaveGame", { to: opponent._id });
        }
        closeGame();
    };

    if (activeGame !== 'connect4') return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-sm animate-fade-in select-none">
            <div
                className="bg-[#1A1D29] border border-gray-800 w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-800 bg-[#12141C]/80 shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
                            <IoGameControllerOutline className="text-xl" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-white leading-tight">
                                Connect 4 (Four-in-a-Row)
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
                    <div className={`flex items-center gap-2.5 p-2 rounded-xl transition-all ${turn === myColor && !winningInfo ? 'bg-indigo-500/15 ring-1 ring-indigo-500/50' : ''}`}>
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
                            <span className={`text-[11px] font-black ${myColor === 'red' ? 'text-rose-400' : 'text-amber-400'}`}>
                                {myColor.toUpperCase()} ({scores.player})
                            </span>
                        </div>
                    </div>

                    {/* Draws */}
                    <div className="text-center px-2">
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold block">Draws</span>
                        <span className="text-xs font-bold text-gray-300">{scores.draws}</span>
                    </div>

                    {/* Opponent */}
                    <div className={`flex items-center gap-2.5 p-2 rounded-xl transition-all ${turn === otherColor && !winningInfo ? 'bg-purple-500/15 ring-1 ring-purple-500/50' : ''}`}>
                        <div className="text-right">
                            <p className="text-xs font-bold text-white truncate max-w-[80px]">
                                {opponent?.fullname || "Opponent"}
                            </p>
                            <span className={`text-[11px] font-black ${otherColor === 'red' ? 'text-rose-400' : 'text-amber-400'}`}>
                                {otherColor.toUpperCase()} ({scores.opponent})
                            </span>
                        </div>
                        {gameMode === 'bot' ? (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                                🤖
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
                                <span className={`animate-pulse font-bold ${myColor === 'red' ? 'text-rose-400' : 'text-amber-400'}`}>
                                    👉 Your Turn! Drop a ({myColor.toUpperCase()}) token
                                </span>
                            ) : (
                                <span className="text-gray-400 font-medium">
                                    Waiting for {opponent?.fullname || "Opponent"} ({otherColor.toUpperCase()})...
                                </span>
                            )}
                        </p>
                    ) : winningInfo.winner === 'draw' ? (
                        <p className="text-xs font-bold text-amber-400">
                            🤝 Full board! It's a Draw.
                        </p>
                    ) : winningInfo.winner === myColor ? (
                        <p className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1 animate-bounce">
                            <FiAward className="text-base" /> Connect 4 Victory! You won! 🎉
                        </p>
                    ) : (
                        <p className="text-xs font-bold text-rose-400">
                            {opponent?.fullname || "Opponent"} connected 4! Good game.
                        </p>
                    )}
                </div>

                {/* Connect 4 Board (7 cols x 6 rows) */}
                <div className="p-4 sm:p-6 flex flex-col items-center justify-center bg-[#1A1D29]">
                    {/* Top Column Drop Indicators */}
                    <div className="grid grid-cols-7 gap-2 w-full max-w-sm mb-2 px-2">
                        {Array.from({ length: COLS }).map((_, col) => {
                            const isColFull = getAvailableRow(board, col) === -1;
                            const isHovered = hoverCol === col && isMyTurn && !winningInfo && !isColFull;
                            return (
                                <button
                                    key={col}
                                    type="button"
                                    onClick={() => handleColumnClick(col)}
                                    onMouseEnter={() => setHoverCol(col)}
                                    onMouseLeave={() => setHoverCol(null)}
                                    disabled={!isMyTurn || isColFull || Boolean(winningInfo)}
                                    className={`h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                                        isHovered
                                            ? myColor === 'red' ? 'bg-rose-500/30 text-rose-400' : 'bg-amber-500/30 text-amber-400'
                                            : 'opacity-0'
                                    }`}
                                >
                                    ▼
                                </button>
                            );
                        })}
                    </div>

                    {/* The Blue Connect 4 Rack */}
                    <div className="bg-[#1e2338] border-2 border-indigo-500/40 p-3 sm:p-4 rounded-2xl shadow-xl w-full max-w-sm">
                        <div className="grid grid-cols-7 gap-2">
                            {Array.from({ length: ROWS }).map((_, r) =>
                                Array.from({ length: COLS }).map((_, c) => {
                                    const idx = r * COLS + c;
                                    const val = board[idx];
                                    const isWinningToken = winningInfo?.line?.includes(idx);
                                    return (
                                        <div
                                            key={idx}
                                            onClick={() => handleColumnClick(c)}
                                            onMouseEnter={() => setHoverCol(c)}
                                            onMouseLeave={() => setHoverCol(null)}
                                            className={`aspect-square rounded-full flex items-center justify-center transition-all cursor-pointer shadow-inner ${
                                                val === null
                                                    ? 'bg-[#12141C] border border-gray-800/80 hover:bg-[#161928]'
                                                    : val === 'red'
                                                    ? 'bg-gradient-to-tr from-rose-600 to-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]'
                                                    : 'bg-gradient-to-tr from-amber-500 to-yellow-400 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                                            } ${isWinningToken ? 'ring-4 ring-white animate-pulse scale-105' : ''}`}
                                        />
                                    );
                                })
                            )}
                        </div>
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
                            onClick={() => startBotGame('connect4', { fullname: "NexBot AI" }, myColor)}
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

export default Connect4Modal;
