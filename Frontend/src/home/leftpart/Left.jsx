import React from 'react'
import Search from './Search.jsx'
import Users from './Users.jsx'
import Logout from './Logout.jsx'



export function Left() {
  return (
    <div className="flex flex-col w-[30%] bg-[#12141C] border border-gray-800">
    <Search/>

    <div className="flex-1 overflow-y-auto ">
    <Users />
    </div>

    <Logout />
    </div>
    )
  }

export default Left