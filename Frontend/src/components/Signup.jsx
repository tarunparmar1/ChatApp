import React from 'react';
import { useForm } from "react-hook-form";
import { useAuth } from '../context/AuthContext';
import axios from "axios";

function Signup() {
    const [authUser, setAuthUser] = useAuth()
    const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const password = watch("password","");
  const confirmpassword = watch("confirmpassword","");

  const validatePasswordMatch=(value) =>{
      return value===password || "password  not match"
    }
    const onSubmit = async (data) => {
        const userInfo={
            fullname:data.fullname,
            email:data.email,
            password:data.password,
            confirmpassword:data.confirmpassword
        }
       await axios.post("http://localhost:3000/user/signup",userInfo)
            .then((response) => {
                if(response.data)
                {
                    alert("signup successful");
                }
                localStorage.setItem("chatapp",JSON.stringify(response.data));
                setAuthUser(response.data);
            })
            .catch((error) => {
             if(error.response){
                alert("Error:"+error.response.data.error)
             }
            });
            
    };
    return (
        <>
            <div className="flex h-screen items-center justify-center p-[1rem]">
                <form
               onSubmit={handleSubmit(onSubmit)}
                className=" border border-white px-6 py-5 rounded-md max-w-[20rem] space-y-3 ">
                    <h1 className="text-2xl text-center">
                        <span className='text-blue-600'>chat app</span>
                     </h1>
                    <h1 className ="text-xl text-white">Signup</h1>
                    <br />
                    {/*full name*/}
                    <label className="input validator">
                        <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <g
                                strokeLinejoin="round"
                                strokeLinecap="round"
                                strokeWidth="2.5"
                                fill="none"
                                stroke="currentColor"
                            >
                                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </g>
                        </svg>
                        <input
                            type="text"
                            required
                            placeholder="Full name"
                            pattern="[A-Za-z][A-Za-z0-9\-]*"
                            minLength="3"
                            maxLength="30"
                            title="Only letters, numbers or dash"
                            {...register("fullname", { required: true })}
                        />
                    </label>
                     {errors.fullname && (<span className="text-red-500">This field is required</span>)}

                 
                    {/* Email*/}
                    <label className="input validator">
                        <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
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
                        <input type="email" placeholder="mail@site.com" required
                            {...register("email", { required: true })} />
                    </label>
                     {errors.email && (<span className="text-red-500">This field is required</span>)}
                       <div className="validator-hint hidden">Enter valid email address</div>

                    {/* password*/}
                    <label className="input validator">
                        <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <g
                                strokeLinejoin="round"
                                strokeLinecap="round"
                                strokeWidth="2.5"
                                fill="none"
                                stroke="currentColor"
                            >
                                <path
                                    d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"
                                ></path>
                                <circle cx="16.5" cy="7.5" r=".5" fill="currentColor"></circle>
                            </g>
                        </svg>
                        <input
                            type="password"
                            required
                            placeholder="Password"
                            minLength="8"
                            // pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                            // title="Must be more than 8 characters, including number, lowercase letter, uppercase letter"
                                {...register("password", { required: true })}
                        />
                    </label>
                     {errors.password && (<span className="text-red-500">This field is required</span>)}

                    {/* <p className="validator-hint hidden">
                        Must be more than 8 characters, including
                        <br />At least one number <br />At least one lowercase letter <br />At least one uppercase letter
                    </p> */}
                    {/* conform password*/}
                    <label className="input validator">
                        <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <g
                                strokeLinejoin="round"
                                strokeLinecap="round"
                                strokeWidth="2.5"
                                fill="none"
                                stroke="currentColor"
                            >
                                <path
                                    d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"
                                ></path>
                                <circle cx="16.5" cy="7.5" r=".5" fill="currentColor"></circle>
                            </g>
                        </svg>
                        <input
                            type="password"
                            required
                            placeholder=" confirm Password"
                            minLength="8"
                            // pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                            // title="Must be more than 8 characters, including number, lowercase letter, uppercase letter"
                                {...register("confirmpassword", { required: true,validate:validatePasswordMatch })}
                        />

                    </label>
                         {errors.confrimpassword && (<span className="text-red-500">
                            {errors.confrimpassword.message}
                            </span>)}
                    {/* <p className="validator-hint hidden">
                        Must be more than 8 characters, including
                        <br />At least one number <br />At least one lowercase letter <br />At least one uppercase letter
                    </p> */}
                  
                    {/* text and button*/}
                    <div className="flex justify-between">
                        <p>Have an Account?
                            <span className="text-blue-500 underline cursor-pointer ml-1"> Login</span>
                        </p>
                        <input type="submit" value="Signup" className="text-white bg-green-500 px-2 py-1 rounded-lg cursor-pointer"/>
                    </div>
                </form>
            </div>
        </>
    )
}

export default Signup;