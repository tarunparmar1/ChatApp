import React from 'react'
import Left from './home/leftpart/Left.jsx'
import Right from './home/rightpart/Right.jsx'
import Signup from './components/Signup.jsx'
import Login from './components/Login.jsx'
import { useAuth } from './context/Authprovider.jsx'

function App() {
  const [authUser,setAuthUser] = userAuth();
  console.log(authUser);

    return (
      // <div className=" flex h-screen">
       
      //   <Left/>
      //   <Right/>
      // </div>
       < Signup />
      // < Login />
    )
  
}

export default App