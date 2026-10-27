import React from 'react'
import { useForm } from "react-hook-form";
import { useAuth } from "../context/Authprovider.jsx";
import axios from "axios";
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import logo from "../assets/logo.png"
import PrivacyPolicy from './PrivacyPolicy';

function Login() {
    const [authUser, setAuthUser] = useAuth();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const onSubmit = async (data) => {
        const userInfo = {
            fullname: data.fullname,
            email: data.email,
            password: data.password,
            confirmpassword: data.confirmpassword
        };
        await axios.post("/api/user/login", userInfo)
            .then((response) => {
                if (response.data) {
                    toast.success("Login successful");
                }
                localStorage.setItem("chatapp", JSON.stringify(response.data));
                setAuthUser(response.data);
            })
            .catch((error) => {
                if (error.response) {
                    toast.error("Error:" + error.response.data.error);
                }
            });
    };

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-[#12141C]">
            {/* Login Form Card */}
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="w-full max-w-[22rem] border border-gray-700/80 bg-[#1A1D29] px-6 py-6 rounded-2xl shadow-2xl space-y-4"
            >
                {/* Logo */}
                <div className="flex items-center justify-center">
                    <img
                        src={logo}
                        alt="NexChat"
                        className="w-28 h-28 object-contain"
                    />
                </div>

                {/* Login title */}
                <h1 className="text-2xl font-bold text-white text-center">
                    Login
                </h1>

                {/* Email */}
                <div>
                    <label className="input validator w-full">
                        <svg
                            className="h-[1em] opacity-50"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                        >
                            <g
                                strokeLinejoin="round"
                                strokeLinecap="round"
                                strokeWidth="2.5"
                                fill="none"
                                stroke="currentColor"
                            >
                                <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                            </g>
                        </svg>

                        <input
                            type="email"
                            placeholder="mail@site.com"
                            {...register("email", { required: true })}
                        />
                    </label>

                    {errors.email && (
                        <span className="text-red-500 text-xs">
                            This field is required
                        </span>
                    )}
                </div>

                {/* Password */}
                <div>
                    <label className="input validator w-full">
                        <svg
                            className="h-[1em] opacity-50"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                        >
                            <g
                                strokeLinejoin="round"
                                strokeLinecap="round"
                                strokeWidth="2.5"
                                fill="none"
                                stroke="currentColor"
                            >
                                <path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"></path>
                                <circle cx="16.5" cy="7.5" r=".5" fill="currentColor"></circle>
                            </g>
                        </svg>

                        <input
                            type="password"
                            placeholder="Password"
                            {...register("password", { required: true })}
                        />
                    </label>

                    {errors.password && (
                        <span className="text-red-500 text-xs">
                            This field is required
                        </span>
                    )}
                </div>

                {/* Signup + Login Button */}
                <div className="flex items-center justify-between text-sm pt-2">
                    <p className="text-white text-xs">
                        New user?
                        <Link
                            to="/signup"
                            className="text-indigo-400 hover:text-indigo-300 underline cursor-pointer ml-1 font-semibold"
                        >
                            Signup
                        </Link>
                    </p>

                    <input
                        type="submit"
                        value="Login"
                        className="text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-colors shadow-md active:scale-95"
                    />
                </div>
            </form>

            {/* Clickable Privacy Policy link */}
            <PrivacyPolicy />
        </div>
    );
}

export default Login;