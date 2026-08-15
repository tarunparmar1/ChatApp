import React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import axios from "axios"
import Cookies from "js-cookie"

function useGetAllusers() {

    const [allUsers,setAllUsers] = useState([])
    const [loading,setLoading] = useState(false)
    useEffect(() =>{
        const getUsesr=async()=>{
       setLoading (true)
       try {
        const token=Cookies.get("jwt")
        const response= await axios.get("/api/user/allusers",{
        withCredentials: true,
            headers:{
                Authorization:`Bearer ${token}`
            }
        })
        setAllUsers(response.data);
        setLoading(false)
        
       } catch (error) {
        console.log("Error in getalluser" + error);
       }
       
        }
        getUsesr()
    },[])
  return [allUsers,loading]
}

export default useGetAllusers