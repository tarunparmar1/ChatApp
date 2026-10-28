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
        const userId = req.user._id;

        let conversation = await Conversation.findOne({
            members: { $all: [userId, chatUser] },
        }).populate("messages");

        if (!conversation) {
            return res.status(200).json([]);
        }
        // Filter out messages that are deleted for this user or for everyone
        const filteredMessages = conversation.messages.filter(msg => {
            if (msg.deletedForEveryone) return false;
            if (msg.deletedFor && msg.deletedFor.includes(userId)) return false;
            return true;
        });
        res.status(200).json(filteredMessages);
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

// Delete a single message
export const deleteMessage = async (req, res) => {
    try {
        const { id: messageId } = req.params;
        const { deleteType } = req.body; // "forMe" or "forEveryone"
        const userId = req.user._id;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ error: "Message not found" });
        }

        if (deleteType === "forMe") {
            if (!message.deletedFor) message.deletedFor = [];
            if (!message.deletedFor.includes(userId)) {
                message.deletedFor.push(userId);
                await message.save();
            }
            return res.status(200).json({ message: "Message hidden for you" });
        } else if (deleteType === "forEveryone") {
            if (!message.senderId.equals(userId)) {
                return res.status(403).json({ error: "Only sender can delete for everyone" });
            }
            message.deletedForEveryone = true;
            await message.save();
            const receiverSocketId = getReceiverSocketId(message.receiverId);
            if (receiverSocketId) io.to(receiverSocketId).emit("messageDeleted", { messageId, deleteType: "forEveryone" });
            const senderSocketId = getReceiverSocketId(message.senderId);
            if (senderSocketId) io.to(senderSocketId).emit("messageDeleted", { messageId, deleteType: "forEveryone" });
            return res.status(200).json({ message: "Message deleted for everyone" });
        } else {
            return res.status(400).json({ error: "Invalid deleteType" });
        }
    } catch (error) {
        console.log("Error in deleteMessage", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};