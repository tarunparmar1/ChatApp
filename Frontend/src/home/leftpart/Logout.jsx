import { FiLogOut } from "react-icons/fi";
import React from 'react'
import { useState } from "react";
import Cookies from "js-cookie"
import axios from "axios";
import toast from "react-hot-toast";

 function Logout() {
  const [loading,setLoading] = useState(false);
  const handleLogout = async () =>{
    setLoading(true);
    try {
       const res = await axios.post("/api/user/logout");
       localStorage.removeItem("chatapp");
       Cookies.remove("jwt");
       setLoading(false);
       toast.success("logged out successfully");
       window.location.reload();
    } catch (error) {
      console.log("Error in logout",error);
      toast.error("Error in logout")
    }
  };
  return (
    <div className="h-[8vh] bg-[#1A1D29] bottom-0">
        <FiLogOut className="text-5xl text-white hover:bg-gray-500 duration-300 cursor-pointer rounded-full p-2 ml-2 mt-1" onClick={handleLogout} />
    </div>
  )
}
export default Logout