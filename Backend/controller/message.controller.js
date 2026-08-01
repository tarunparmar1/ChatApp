import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";

export const sendMessage= async(req,res)=>{
   try {
    const {message} = req.body;
    const {id:receiverId} = req.params;
    const senderId = req.user._id;

    let conversation=await Conversation.findOne({
        members:{$all:[senderId,receiverId]}
    })
    if(!conversation){
        conversation =await Conversation.create({
        members:[  senderId,receiverId],
        });
    }
    const newMessage = new Message({
        senderId,
        receiverId,
        message,
    });

    if(newMessage){
        conversation.messages.push(newMessage._id);
    }

    // await conversation.save();
    // await newMessage.save();
    await Promise.all([conversation.save(),newMessage.save()]);
    res.status(201).json({
              message:"message sent successfully",
              newMessage
    });
   } catch (error) {
    console.log("error in send message" , error);
    res.status(500).json({error:"internal server error"});
   }
};

export const getMessage = async (req,res) => {
    try {
        const {id: chatUser} = req.params;
        const senderId  = req.user._id;

        let conversataion = await Conversation.findOne({
            members: { $all: [senderId,chatUser]},
        }).populate("messages")

        if(!conversataion){
            return res.status(201).json([]);
        }
        const messages = conversataion.messages;
        res.status(201).json(messages);
        
    } catch (error) {
        console.log(" Error in get message", error);
        res.status(500).json({error:"Interal serevre error "});
        
    }
}