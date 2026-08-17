import React from 'react'
import Left from './home/leftpart/Left.jsx'
import Right from './home/rightpart/Right.jsx'
import Signup from './components/Signup.jsx'
import Login from './components/Login.jsx'
import NotFound from "./components/NotFound.jsx";
import { useAuth } from './context/Authprovider.jsx'
import { Navigate, Route, Routes } from "react-router-dom"
import { Toaster } from "react-hot-toast"

function App() {
  const [authUser, setAuthUser] = useAuth();

  // console.log(authUser);

  return (
    <>
      <Routes>

        <Route
          path="/"
          element={
            authUser ? (
              
              <div className="drawer lg:drawer-open h-screen">

                {/* Drawer checkbox */}
                <input
                  id="my-drawer-2"
                  type="checkbox"
                  className="drawer-toggle"
                />

                {/* RIGHT SIDE */}
                <div className="drawer-content h-screen">
                  <Right />
                </div>

                {/* LEFT SIDEBAR */}
                <div className="drawer-side z-50">

                  {/* Overlay */}
                  <label
                    htmlFor="my-drawer-2"
                    aria-label="close sidebar"
                    className="drawer-overlay"
                  ></label>

                  {/* Sidebar */}
                  <div className="w-80 h-screen bg-[#12141C]">
                    <Left />
                  </div>

                </div>

              </div>

            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* LOGIN */}
        <Route
          path="/login"
          element={
            authUser ? <Navigate to="/" /> : <Login />
          }
        />

        {/* SIGNUP */}
        <Route
          path="/signup"
          element={
            authUser ? <Navigate to="/" /> : <Signup />
          }
        />
         {/* 404 */}
  <Route path="*" element={<NotFound />} />

      </Routes>

      <Toaster />
    </>
  )
}

export default App