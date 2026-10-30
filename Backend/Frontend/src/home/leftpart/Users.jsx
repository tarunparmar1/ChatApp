import React, { useState } from 'react'
import User from './User'
import useGetAllusers from '../../context/useGetAllusers'
import { useSocketContext } from '../../context/SocketContext'
import useConversation from '../../zustand/userConversation'

function Users() {
    const [allUsers, loading] = useGetAllusers();
    const { onlineUsers } = useSocketContext();
    const { favorites } = useConversation();

    // Tab: 'all' | 'online' | 'favorites'
    const [activeTab, setActiveTab] = useState('all');

    // Convert online user IDs to strings for robust matching across reloads
    const onlineSet = new Set(onlineUsers.map(id => String(id)));

    const filteredUsers = () => {
        if (activeTab === 'online') {
            return allUsers.filter((u) => onlineSet.has(String(u._id)));
        }
        if (activeTab === 'favorites') {
            return allUsers.filter((u) => favorites.includes(u._id));
        }
        return allUsers;
    };

    const onlineCount = allUsers.filter((u) => onlineSet.has(String(u._id))).length;

    const tabs = [
        { id: 'all', label: 'All' },
        { id: 'online', label: 'Online', count: onlineCount },
        { id: 'favorites', label: 'Favorites', count: favorites.length },
    ];

    const users = filteredUsers();

    return (
        <div className="flex flex-col h-full">
            {/* Tab bar */}
            <div className="shrink-0 flex items-center gap-1 bg-[#1A1D29] px-3 py-2 border-b border-[#2a2d3e]">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            flex: 1,
                            padding: '6px 0',
                            borderRadius: '8px',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            fontWeight: activeTab === tab.id ? '700' : '400',
                            background: activeTab === tab.id
                                ? '#8b5cf6'
                                : 'transparent',
                            color: activeTab === tab.id ? '#fff' : '#9ca3af',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                        }}
                    >
                        {tab.label}
                        {tab.count !== undefined && tab.count > 0 && (
                            <span style={{
                                background: activeTab === tab.id ? 'rgba(255,255,255,0.25)' : '#6366f1',
                                color: '#fff',
                                borderRadius: '999px',
                                fontSize: '0.65rem',
                                padding: '1px 6px',
                                fontWeight: '700',
                                lineHeight: '1.4',
                            }}>
                                {tab.count-1}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* User list */}
            <div className="py-2 flex-1 overflow-y-auto hide-scrollbar">
                {loading ? (
                    <div style={{ color: '#9ca3af', textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem' }}>
                        Loading…
                    </div>
                ) : users.length === 0 ? (
                    <div style={{ color: '#6b7280', textAlign: 'center', marginTop: '3rem', fontSize: '0.85rem', padding: '0 1rem' }}>
                        {activeTab === 'online' && 'No users online right now'}
                        {activeTab === 'favorites' && 'No favourites yet – star someone!'}
                        {activeTab === 'all' && 'No users found'}
                    </div>
                ) : (
                    users.map((user, index) => (
                        <User key={user._id || index} user={user} />
                    ))
                )}
            </div>
        </div>
    )
}

export default Users