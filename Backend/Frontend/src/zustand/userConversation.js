import { create } from 'zustand'

// Load favorites from localStorage on first run
const loadFavorites = () => {
  try {
    const stored = localStorage.getItem("chatapp_favorites");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const useConversation = create((set) => ({
  selectedConversation: null,
  setSelectedConversation: (selectedConversation) =>
    set({ selectedConversation }),
  messages: [],
  setMessage: (messages) => set({ messages }),

  // Favorites – array of user _id strings
  favorites: loadFavorites(),
  toggleFavorite: (userId) =>
    set((state) => {
      const exists = state.favorites.includes(userId);
      const updated = exists
        ? state.favorites.filter((id) => id !== userId)
        : [...state.favorites, userId];
      localStorage.setItem("chatapp_favorites", JSON.stringify(updated));
      return { favorites: updated };
    }),
}));

export default useConversation;