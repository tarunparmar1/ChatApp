import React from 'react'
import Search from './Search.jsx'
import Users from './Users.jsx'
import Logout from './Logout.jsx'

export function Left() {
  return (
    <div className="w-full h-screen flex flex-col bg-[#12141C]">

      {/* Search */}
      <div className="shrink-0">
        <Search />
      </div>

      {/* Users */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <Users />
      </div>

      {/* Logout */}
      <div className="shrink-0">
        <Logout />
      </div>

    </div>
  )
}

export default Left