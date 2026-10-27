import React, { useEffect } from 'react'
import Left from './home/leftpart/Left.jsx'
import Right from './home/rightpart/Right.jsx'
import Signup from './components/Signup.jsx'
import Login from './components/Login.jsx'
import NotFound from "./components/NotFound.jsx";
import { useAuth } from './context/Authprovider.jsx'
import { Navigate, Route, Routes } from "react-router-dom"
import { Toaster, toast } from "react-hot-toast"
import useConversation from './zustand/userConversation.js'
import useGameStore from './zustand/useGameStore.js'
import { useSocketContext } from './context/SocketContext.jsx'
import TicTacToeModal from './components/TicTacToeModal.jsx'
import Connect4Modal from './components/Connect4Modal.jsx'
import TankDuelModal from './components/TankDuelModal.jsx'
import GameCenterModal from './components/GameCenterModal.jsx'
import GameInviteBanner from './components/GameInviteBanner.jsx'

function App() {
  const [authUser] = useAuth();
  const { selectedConversation } = useConversation();
  const { socket } = useSocketContext();
  const { setIncomingInvite, startOnlineGame } = useGameStore();

  // Global socket listener for game challenges (Tank Duel, Tic-Tac-Toe, Connect 4)
  useEffect(() => {
    if (!socket) return;

    const onInviteReceived = ({ from, gameType = 'tictactoe' }) => {
      setIncomingInvite({ from, gameType });
    };

    const onInviteAccepted = ({ from, gameType = 'tictactoe' }) => {
      const gameTitle = gameType === 'tankduel' ? 'Tank Duel 8-Bit' : gameType === 'connect4' ? 'Connect 4' : 'Tic-Tac-Toe';
      toast.success(`${from?.fullname || "Opponent"} accepted your ${gameTitle} challenge!`, {
        icon: "🎮",
      });
      const symbol = gameType === 'tankduel' ? 'p1' : gameType === 'connect4' ? 'red' : 'X';
      startOnlineGame(gameType, from, symbol);
    };

    const onInviteDeclined = () => {
      toast.error("Game challenge declined");
    };

    socket.on("gameInviteReceived", onInviteReceived);
    socket.on("gameInviteAccepted", onInviteAccepted);
    socket.on("gameInviteDeclined", onInviteDeclined);

    return () => {
      socket.off("gameInviteReceived", onInviteReceived);
      socket.off("gameInviteAccepted", onInviteAccepted);
      socket.off("gameInviteDeclined", onInviteDeclined);
    };
  }, [socket, setIncomingInvite, startOnlineGame]);

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            authUser ? (
              <div className="flex h-screen h-[100dvh] w-screen overflow-hidden bg-[#12141C]">
                {/* LEFT SIDEBAR (All / Online / Favorites user list) */}
                <aside
                  className={`
                    ${selectedConversation ? "hidden md:flex" : "flex"}
                    w-full md:w-[320px] lg:w-[360px] xl:w-[400px] shrink-0 h-full flex-col border-r border-gray-800/80
                  `}
                >
                  <Left />
                </aside>

                {/* RIGHT CHAT AREA (Header, Messages, Input) */}
                <main
                  className={`
                    ${selectedConversation ? "flex" : "hidden md:flex"}
                    flex-1 h-full flex-col min-w-0 bg-[#12141C]
                  `}
                >
                  <Right />
                </main>
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* LOGIN */}
        <Route
          path="/login"
          element={authUser ? <Navigate to="/" /> : <Login />}
        />

        {/* SIGNUP */}
        <Route
          path="/signup"
          element={authUser ? <Navigate to="/" /> : <Signup />}
        />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Global Arcade Games Modals & Challenge Banner */}
      <GameCenterModal />
      <TankDuelModal />
      <TicTacToeModal />
      <Connect4Modal />
      <GameInviteBanner />

      <Toaster />
    </>
  );
}

export default App;