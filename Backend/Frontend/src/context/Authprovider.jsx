import React, { children, createContext, useState } from 'react'
import Cookies from "js-cookie"
import { create } from 'axios';
import { useContext } from 'react';
export const AuthContext = createContext()

export const AuthProvider = ({children}) =>{
    let initialUser = undefined;
    try {
        const stored = localStorage.getItem("chatapp");
        if (stored) {
            initialUser = JSON.parse(stored);
        }
    } catch (e) {
        console.error("Failed to parse auth user:", e);
    }
    const [authUser, setAuthUser] = useState(initialUser);
return (
    <div>
<AuthContext.Provider value={[authUser,setAuthUser]}>
    {children}
</AuthContext.Provider>
    </div>
  );
};

 

export const useAuth = () => useContext(AuthContext);