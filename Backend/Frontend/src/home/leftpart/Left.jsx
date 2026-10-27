import React from 'react'
import Search from './Search.jsx'
import Users from './Users.jsx'
import Logout from './Logout.jsx'

export function Left() {
  return (
    <div className="w-full h-full max-h-full flex flex-col bg-[#12141C] overflow-hidden select-none">
      {/* Search Header */}
      <Search />

      {/* Users List with All / Online / Favorites Tabs */}
      <div className="flex-1 overflow-hidden min-h-0 flex flex-col">
        <Users />
      </div>

      {/* Current User Profile & Logout (always pinned at the bottom) */}
      <Logout />
    </div>
  )
}

export default Left