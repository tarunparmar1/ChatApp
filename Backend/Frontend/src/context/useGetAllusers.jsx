import React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import axios from "axios"
import Cookies from "js-cookie"

function useGetAllusers() {
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const getUsers = async () => {
            setLoading(true);
            try {
                // Get token from cookie or stored user session
                let token = Cookies.get("jwt");
                if (!token) {
                    try {
                        const stored = JSON.parse(localStorage.getItem("chatapp") || "{}");
                        token = stored?.token;
                    } catch (e) {
                        // ignore parse error
                    }
                }

                const headers = {};
                if (token) {
                    headers["Authorization"] = `Bearer ${token}`;
                }

                const response = await axios.get("/api/user/allusers", {
                    withCredentials: true,
                    headers,
                });
                setAllUsers(response.data || []);
                setLoading(false);
            } catch (error) {
                console.log("Error in getalluser:", error);
                setLoading(false);
                // If token expired (401), clear stale storage so user cleanly logs in again
                if (error.response?.status === 401) {
                    localStorage.removeItem("chatapp");
                    Cookies.remove("jwt");
                    window.location.reload();
                }
            }
        };
        getUsers();
    }, []);
    return [allUsers, loading];
}

export default useGetAllusers