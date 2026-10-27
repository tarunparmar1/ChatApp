import mongoose from "mongoose";

const avatarSchema = new mongoose.Schema({
    seed: { type: String },
    style: { type: String, default: "pixel" },
    config: {
        skinColor:      { type: String },
        hairStyle:      { type: String },
        hairColor:      { type: String },
        eyeColor:       { type: String },
        clothingColor:  { type: String },
        accessory:      { type: String },
        bgColor:        { type: String },
    }
}, { _id: false });

const userSchema = mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    conformpassword: {
        type: String,
    },
    bio: {
        type: String,
        default: "Hey there! I am using NexChat.",
    },
    avatar: {
        type: avatarSchema,
        default: null,
    },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;