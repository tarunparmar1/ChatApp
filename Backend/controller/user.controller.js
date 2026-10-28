import User from "../models/user.model.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import bcrypt from "bcryptjs";
import createTokenAndSaveCookie from "../jwt/generateToken.js";
import { generateAvatarConfig } from "../utils/avatarGenerator.js";

export const signup = async (req, res) => {
    const { fullname, email, password, confirmpassword } = req.body;
    try {
        if (password != confirmpassword) {
            return res.status(401).json({ error: "passwords do not match" });
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(409).json({ error: "user alrady registered" });
        }

        const hashpassword = await bcrypt.hash(password, 11);

        const newUser = new User({
            fullname,
            email,
            password: hashpassword,
        });

        await newUser.save();

        // Generate deterministic pixel-art avatar from the new user's _id
        const avatarConfig = generateAvatarConfig(newUser._id.toString());
        newUser.avatar = avatarConfig;
        await newUser.save();

        if (newUser) {
            const token = createTokenAndSaveCookie(newUser._id, res);
            res.status(201).json({
                message: "user created successfully",
                token,
                user: {
                    _id:       newUser._id,
                    fullname:  newUser.fullname,
                    email:     newUser.email,
                    bio:       newUser.bio || "Hey there! I am using NexChat.",
                    avatar:    newUser.avatar,
                    createdAt: newUser.createdAt,
                },
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "somthing went wrong while creating user" });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "Invalid user Email id" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid password" });
        }

        // Backfill avatar if missing (for users created before this feature)
        if (!user.avatar) {
            user.avatar = generateAvatarConfig(user._id.toString());
            await user.save();
        }

        const token = createTokenAndSaveCookie(user._id, res);
        res.status(201).json({
            message: "User logged in successfully",
            token,
            user: {
                _id:       user._id,
                fullname:  user.fullname,
                email:     user.email,
                bio:       user.bio || "Hey there! I am using NexChat.",
                avatar:    user.avatar,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        console.error("Error in login controller:", error);
        res.status(500).json({ error: error.message || "Something went wrong while login user" });
    }
};

export const logout = async (req, res) => {
    try {
        res.clearCookie("jwt");
        res.status(201).json({ message: "user logged out successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "somthing went wrong while logout user" });
    }
};

export const allUsers = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized - user not found" });
        }

        const loggedInUser = req.user._id;

        const filteredUsers = await User.find({
            _id: { $ne: loggedInUser }
        }).select("-password");

        // Backfill avatar for any user that doesn't have one yet
        const backfillPromises = filteredUsers
            .filter((u) => !u.avatar)
            .map((u) => {
                u.avatar = generateAvatarConfig(u._id.toString());
                return u.save();
            });

        if (backfillPromises.length > 0) await Promise.all(backfillPromises);

        return res.status(200).json(filteredUsers);
    } catch (error) {
        console.log("Error in all users controller:", error);
        return res.status(500).json({ error: "Something went wrong while getting users" });
    }
};

export const updateProfile = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const userId = req.user._id;
        const { fullname, bio, avatar } = req.body;

        const updateData = {};
        if (fullname && typeof fullname === "string" && fullname.trim()) {
            updateData.fullname = fullname.trim();
        }
        if (bio !== undefined && typeof bio === "string") {
            updateData.bio = bio.trim();
        }
        if (avatar && avatar.config) {
            updateData.avatar = avatar;
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true }
        ).select("-password");

        return res.status(200).json({
            message: "Profile updated successfully",
            user: {
                _id:       updatedUser._id,
                fullname:  updatedUser.fullname,
                email:     updatedUser.email,
                bio:       updatedUser.bio || "Hey there! I am using NexChat.",
                avatar:    updatedUser.avatar,
                createdAt: updatedUser.createdAt,
            },
        });
    } catch (error) {
        console.log("Error in updateProfile:", error);
        return res.status(500).json({ error: "Something went wrong while updating profile" });
    }
};

export const deleteAccount = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const userId = req.user._id;

        // Delete all conversations where user is a member, and their messages
        const conversations = await Conversation.find({ members: userId });
        for (const conv of conversations) {
            if (conv.messages && conv.messages.length > 0) {
                await Message.deleteMany({ _id: { $in: conv.messages } });
            }
            await Conversation.findByIdAndDelete(conv._id);
        }

        // Delete any remaining messages sent or received by this user
        await Message.deleteMany({
            $or: [{ senderId: userId }, { receiverId: userId }]
        });

        // Delete the user record
        await User.findByIdAndDelete(userId);

        res.clearCookie("jwt");
        return res.status(200).json({ message: "Account deleted successfully" });
    } catch (error) {
        console.log("Error in deleteAccount:", error);
        return res.status(500).json({ error: "Something went wrong while deleting account" });
    }
};