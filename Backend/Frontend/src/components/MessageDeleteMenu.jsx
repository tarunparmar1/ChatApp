import { useState, useEffect } from 'react';

export default function MessageDeleteMenu({ onDeleteForMe, onDeleteForEveryone }) {
  const [open, setOpen] = useState(false);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest('.msg-delete-menu')) setOpen(false);
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <div className="relative msg-delete-menu">
      <button
        onClick={() => setOpen(!open)}
        className="p-1 text-gray-400 hover:text-gray-200 transition"
        aria-label="Message options"
      >
        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
          <circle cx="4" cy="10" r="2" />
          <circle cx="10" cy="10" r="2" />
          <circle cx="16" cy="10" r="2" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-48 bg-gray-800 rounded shadow-lg z-10">
          <button
            onClick={onDeleteForMe}
            className="block w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700"
          >
            Delete for me
          </button>
          <button
            onClick={onDeleteForEveryone}
            className="block w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-gray-700"
          >
            Delete for everyone
          </button>
        </div>
      )}
    </div>
  );
}
