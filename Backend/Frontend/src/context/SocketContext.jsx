import { Children, useEffect,useContext } from "react";
import { useAuth } from "./Authprovider";
import { io } from "socket.io-client";
import {createContext, useState} from "react";


const socketContext = createContext();
export const useSocketContext =() =>{
    return useContext(socketContext);
};

export const  SocketProvider = ({ children}) =>{
    const [socket,setSocket] = useState(null);
    const [onlineUsers,setOnlineUsers] = useState([]);
    const [authUser] = useAuth();

    useEffect(() =>{
        if(authUser){
            const socket = io("https://chatapp-obxh.onrender.com",{
                query:{
                    userId: authUser.user._id,
                },
            });
            setSocket(socket);
            socket.on("getOnlineUsers",(users) =>{
                setOnlineUsers(users);
            }) 
            return() =>socket.close();

        }else{
            if(socket){
                socket.close();
                setSocket(null);
            }
        }

    },[authUser]);

    return(
        <socketContext.Provider value={{ socket,onlineUsers}}>
            {children}
        </socketContext.Provider>
    );
};
