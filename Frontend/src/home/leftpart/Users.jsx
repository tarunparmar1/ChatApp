import React from 'react'
import User from './User'

function Users() {
    return (
        <div className="flex flex-col h-full ">
            <h1 className="px-8 py-2 text-white font-semibold bg-[#1A1D29] rounded-md">
                Messages
            </h1>
       <div className=" py-2 flex-1 overflow-y-auto hide-scrollbar">
        <User />
        <User />
        <User />
        <User />
        <User />
        <User />
         <User />
        <User />
         <User />
        <User />
         <User />
        <User />
         <User />
        <User />
       </div>
        </div>
    )
}


export default Users