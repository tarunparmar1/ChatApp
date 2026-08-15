import User from "../models/user.model.js";
import mongoose from "mongoose";
import bcrypt from "bcryptjs"
import createTokenAndSaveCookie from "../jwt/generateToken.js"

 export const signup = async (req,res) => {

    const {fullname ,email,password,confirmpassword} = req.body;
    try {
    if(password != confirmpassword){
        return res.status(401).json({error:"passwords do not match"});
        
        }

        
            const user = await User.findOne({email})
            if(user){
                    return res.status(409).json({error:"user alrady registered"});

            }
            const hashpassword = await bcrypt.hash(password,11)

            const newUser= await new User({
                fullname,
                email,
                password: hashpassword,
            });

             await newUser.save();
             if(newUser){
                createTokenAndSaveCookie(newUser._id,res);
            res.status(201).json({message: "user created successfully ", user:{
                    _id:newUser._id,
                    fullname: newUser.fullname,
                    email:newUser.email
                },});
             }
        } catch (error) {
            console.log(error);
            res.status(500).json({error:"somthing went wrong while creating user"});
        }
    };

    export const login = async(req,res) =>{
        const {email,password} = req.body;
        try {
            const user= await User.findOne({email})
            if(!user){
                 return res.status(400).json({error:"Invalid user  Email id"});
            }
            const isMatch = await bcrypt.compare(password,user.password)
            if(!isMatch){
                return res.status(400).json({error:"Invalid password"});
            }
            createTokenAndSaveCookie(user._id,res);
            res.status(201).json({
                message:"User logged in successfully",
                user:{
                    _id:user._id,
                    fullname: user.fullname,
                    email:user.email
                },
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({error:"somthing went wrong while login user"});
        }
    };

    export const logout = async(req,res) =>{
  try {
    res.clearCookie("jwt");
    res.status(201).json({message:"user logged out successfully "});
  } catch (error) {
     console.log(error);
            res.status(500).json({error:"somthing went wrong while logout user"});
  }
    };

   export const allUsers = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                error: "Unauthorized - user not found"
            });
        }

        const loggedInUser = req.user._id;

        const filteredUsers = await User.find({
            _id: { $ne: loggedInUser }
        }).select("-password");

        return res.status(200).json(filteredUsers);

    } catch (error) {
        console.log("Error in all users controller:", error);

        return res.status(500).json({
            error: "Something went wrong while getting users"
        });
    }
};