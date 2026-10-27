import { create } from 'zustand';

const useGameStore = create((set) => ({
    activeGame: null, // 'tictactoe' | 'connect4' | null
    isGameCenterOpen: false,
    gameMode: 'bot', // 'online' | 'bot'
    opponent: null,
    mySymbol: 'X', // for tictactoe: 'X' | 'O'; for connect4: 'red' | 'yellow'
    incomingInvite: null, // { from: user, gameType: 'tictactoe' | 'connect4' }

    openGameCenter: () => set({ isGameCenterOpen: true }),
    closeGameCenter: () => set({ isGameCenterOpen: false }),

    setIncomingInvite: (invite) => set({ incomingInvite: invite }),
    
    startOnlineGame: (gameType, opponent, symbol = 'X') => set({
        activeGame: gameType,
        isGameCenterOpen: false,
        gameMode: 'online',
        opponent,
        mySymbol: symbol,
        incomingInvite: null,
    }),

    startBotGame: (gameType = 'tictactoe', botOpponent = { fullname: "NexBot AI" }, symbol = 'X') => set({
        activeGame: gameType,
        isGameCenterOpen: false,
        gameMode: 'bot',
        opponent: botOpponent,
        mySymbol: symbol,
        incomingInvite: null,
    }),

    closeGame: () => set({
        activeGame: null,
        opponent: null,
        incomingInvite: null,
    }),
}));

export default useGameStore;
