import { FiLogOut } from "react-icons/fi";
import React from 'react'

 function Logout() {
  return (
    <div className="h-[10vh] bg-[#1A1D29] bottom-0">
        <FiLogOut className="text-5xl text-white hover:bg-gray-500 duration-300 cursor-pointer rounded-full p-2 ml-2 mt-1" />
    </div>
  )
}
export default Logout