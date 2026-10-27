import React from 'react';
import useConversation from '../../zustand/userConversation';
import { useSocketContext } from '../../context/SocketContext';
import PixelAvatar from '../../components/PixelAvatar';

function User({ user }) {
    const { selectedConversation, setSelectedConversation, favorites, toggleFavorite } = useConversation();
    const isSelected = selectedConversation?._id === user._id;
    const { onlineUsers } = useSocketContext();
    const isOnline = onlineUsers.includes(user._id);
    const isFav = favorites.includes(user._id);

    const handleFav = (e) => {
        e.stopPropagation();
        toggleFavorite(user._id);
    };

    return (
        <div
            onClick={() => setSelectedConversation(user)}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px 14px',
                cursor: 'pointer',
                background: isSelected ? 'rgba(99,102,241,0.18)' : 'transparent',
                borderLeft: isSelected ? '3px solid #6366f1' : '3px solid transparent',
                transition: 'background 0.2s, border-color 0.2s',
            }}
            onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
            onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
        >
            {/* Pixel-art avatar */}
            <PixelAvatar
                avatar={user.avatar}
                name={user.fullname}
                size={46}
                isOnline={isOnline}
            />

            {/* Name & status */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <h1 style={{
                    color: '#f3f4f6',
                    fontSize: '0.92rem',
                    fontWeight: '600',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    margin: 0,
                }}>
                    {user.fullname}
                </h1>
                <span style={{
                    color: isOnline ? '#4ade80' : '#6b7280',
                    fontSize: '0.72rem',
                    fontWeight: isOnline ? '600' : '400',
                }}>
                    {isOnline ? '● Online' : (user.bio || user.email)}
                </span>
            </div>

            {/* Favorite star */}
            <button
                onClick={handleFav}
                title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1.15rem',
                    color: isFav ? '#f59e0b' : '#374151',
                    transition: 'color 0.2s, transform 0.15s',
                    padding: '4px',
                    borderRadius: '50%',
                    lineHeight: 1,
                    flexShrink: 0,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#f59e0b'; e.currentTarget.style.transform = 'scale(1.25)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = isFav ? '#f59e0b' : '#374151'; e.currentTarget.style.transform = 'scale(1)'; }}
            >
                {isFav ? '★' : '☆'}
            </button>
        </div>
    );
}

export default User;