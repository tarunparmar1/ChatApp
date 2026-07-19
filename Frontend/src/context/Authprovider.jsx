import React, { children, createContext, useState } from 'react'
import cookies from "js-cookie"
import { create } from 'axios';
import { useContext } from 'react';
export const AuthContext = createContext()

export const AuthProvider = ({children}) =>{
    //parse user dataand storein state
    const [authUser,setAuthUser] = useState(initialUserState? JSON.parse(initialUserState):undefined);
return (
    <div>
<AuthContext.Provider value={[authUser,setAuthUser]}>
    {children}
</AuthContext.Provider>
    </div>
  );
};

 

export const useAuth = () => useContext(AuthContext);