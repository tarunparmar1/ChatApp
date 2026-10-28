import mongoose from "mongoose"

const messageschema = new mongoose.Schema({
    senderId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
     receiverId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    message:{
        type:String,
        required:true,
    },
    deletedFor: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    deletedForEveryone: {
        type: Boolean,
        default: false,
    }
},{timestamps:true});

const Message = mongoose.model("Message",messageschema);
export default Message;