import React from 'react'
import Left from './home/leftpart/Left.jsx'
import Right from './home/rightpart/Right.jsx'
import Signup from './components/Signup.jsx'
import Login from './components/Login.jsx'
import { useAuth } from './context/Authprovider.jsx'
import { Navigate, Route, Routes } from "react-router-dom"

function App() {
  const [authUser, setAuthUser] = useAuth();
  console.log(authUser);

  return (

    //  < Signup />
    // < Login />
    
    <Routes>
      <Route path="/" element={
        authUser ?
         ( <div className=" flex h-screen">
            <Left />
            <Right />
          </div>):
          (
            <Navigate to={"/login"} />
          )
            } />
        <Route path="/login" element={authUser ? <Navigate to="/" />:<Login />} />     
        <Route path="/signup" element={authUser ? <Navigate to="/" />:<Signup />} />  
    </Routes>
  )

}

export default App