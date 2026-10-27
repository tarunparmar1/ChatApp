import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId } from "../SocketIO/server.js";
import { io } from "../SocketIO/server.js";

export const sendMessage = async (req, res) => {
    try {
        const { message } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        let conversation = await Conversation.findOne({
            members: { $all: [senderId, receiverId] }
        });
        if (!conversation) {
            conversation = await Conversation.create({
                members: [senderId, receiverId],
            });
        }
        const newMessage = new Message({
            senderId,
            receiverId,
            message,
        });

        if (newMessage) {
            conversation.messages.push(newMessage._id);
        }

        await Promise.all([conversation.save(), newMessage.save()]);
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }
        res.status(201).json(newMessage);
    } catch (error) {
        console.log("error in send message", error);
        res.status(500).json({ error: "internal server error" });
    }
};

export const getMessage = async (req, res) => {
    try {
        const { id: chatUser } = req.params;
        const senderId = req.user._id;

        let conversataion = await Conversation.findOne({
            members: { $all: [senderId, chatUser] },
        }).populate("messages");

        if (!conversataion) {
            return res.status(200).json([]);
        }
        const messages = conversataion.messages;
        res.status(200).json(messages);
    } catch (error) {
        console.log(" Error in get message", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const deleteConversation = async (req, res) => {
    try {
        const { id: otherUserId } = req.params;
        const senderId = req.user._id;

        const conversation = await Conversation.findOne({
            members: { $all: [senderId, otherUserId] }
        });

        if (!conversation) {
            return res.status(200).json({ message: "No conversation to delete" });
        }

        if (conversation.messages && conversation.messages.length > 0) {
            await Message.deleteMany({ _id: { $in: conversation.messages } });
        }

        await Conversation.findByIdAndDelete(conversation._id);

        const receiverSocketId = getReceiverSocketId(otherUserId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("conversationDeleted", { deletedBy: senderId });
        }

        return res.status(200).json({ message: "Chat deleted successfully" });
    } catch (error) {
        console.log("Error in delete conversation:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};