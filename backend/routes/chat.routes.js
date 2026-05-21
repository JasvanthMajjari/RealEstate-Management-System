import express from "express";
import Chat from "../models/chat.model.js";
import { protect } from "../middleware/auth.middleware.js";

const chatRouter = express.Router();
chatRouter.use(protect);

//to create a chat

chatRouter.post("/start", async (req, res) => {
  try {
    const { propertyId, sellerId, buyerId: providedBuyerId } = req.body;
    let buyerId, finalSellerId;

    // if seller is logged in

    if (req.user.role === "seller") {
      buyerId = providedBuyerId;
      finalSellerId = req.user._id;
    } else {
      buyerId = req.user._id;
      finalSellerId = sellerId;
    }

    if (!buyerId || !finalSellerId || !propertyId) {
      return res.status(400).json({
        success: false,
        message: "Missng buyer or seller Id or property Id",
      });
    }

    //Prevent self chat
    if (!buyerId.toString() === finalSellerId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot chat with yourself..",
      });
    }

    //check for an existing chat btw this buyer and seller
    let chat = await Chat.findOne({
      property: propertyId,
      buyer: buyerId,
      seller: finalSellerId,
    });

    //Create a new chat if not exists

    if (!chat) {
      chat = await Chat.create({
        property: propertyId, //initial property id
        buyer: buyerId,
        seller: finalSellerId,
        messages: [],
      });
    }

    //Populate the details
    chat = await Chat.findById(chat._id)
      .populate("buyer", "name email profilePic")
      .populate("seller", "name email profilePic")
      .populate("property", "title price images");

    res.status(200).json(chat);
  } catch (error) {
    console.error("Start chat Error: ", error);
    res.status(500).json({
      success: false,
      message: "Error creating chat or getting previous one..",
      error: error.message,
    });
  }
});

//to send message

chatRouter.post("/send", async (req, res) => {
  try {
    const { chatId, text, image } = req.body;
    const userId = req.user._id;

    //Validation
    if (!chatId) {
      return res.status(400).json({
        success: false,
        message: "Chat Id is required..",
      });
    }

    //Fine chat
    const chat = await Chat.findById(chatId);
    if (!chat)
      return res.status(404).json({
        success: false,
        message: "Chat not found..",
      });

    //ensure sender is part of this chat
    if (
      chat.buyer.toString() !== userId.toString() &&
      chat.seller.toString() !== userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorised to send message in this chat",
      });
    }

    //Create New Message
    const newMessage = {
      sender: userId,
      text: text || "",
      image: image || "",
      createdAt: new Date(),
    };

    //to push a message
    chat.messages.push(newMessage);
    await chat.save();

    //Latest message
    const saveMessage = chat.messages[chat.messages.length - 1];
    res.status(200).json({ success: true, chat, newMessage: saveMessage });
  } catch (error) {
    console.error("Send message error: ", error);
    res.status(500).json({
      success: false,
      message: "Error in sending message..",
      error: error.message,
    });
  }
});

//to get chats for user
chatRouter.get("/user", protect, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorised User",
      });
    }
    const chats = await Chat.find({
      $or: [{ buyer: req.user._id }, { seller: req.user._id }],
    })
      .populate("buyer", "name email profilePic")
      .populate("seller", "name email profilePic")
      .populate("property", "title price images");

    res.status(200).json(chats);
  } catch (error) {
    console.error("Get User chat error: ", error);
    res.status(500).json({
      success: false,
      message: "Error to fetching user chat..",
      error: error.message,
    });
  }
});

//to get chat message

chatRouter.get("/:chatId", protect, async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user?._id?.toString();

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorised user",
      });
    }

    //Safe Id check
    if (!chatId || chatId.length !== 24) {
      return res.status(400).json({
        success: false,
        message: "Invalid chat Id",
      });
    }
    const chat = await Chat.findById(chatId);

    if (!chat)
      return res
        .status(404)
        .json({ success: false, message: "Chat not found.." });

    //Safe auth check

    const buyerId = chat.buyer?._id?.toString();
    const sellerId = chat.seller?._id?.toString();

    if (buyerId !== userId && sellerId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to access this chat",
      });

      //Non safe populate
      const fullChat = await Chat.findById(chatId)
        .populate("buyer", "name email profilePic")
        .populate("seller", "name email profilePic")
        .populate("messages.sender", "name profilePic");
    }
    res.status(200).json(chat);
  } catch (error) {
    console.error("Get Chat Error: ", error);
    res.status(500).json({
      success: false,
      message: "Error fetching chat messages..",
      error: error.message,
    });
  }
});

//to delete an entire chat

chatRouter.delete("/:chatId", async (req, res) => {
  try {
    const userId = req.user._id;
    const chat = await Chat.findById(req.params.chatId);

    if (!chat)
      return res
        .status(404)
        .json({ success: false, message: "Chat not found.." });

    //We wnsure the user is part of the chat

    if (
      chat.buyer.toString() !== userId.toString() &&
      chat.seller.toString() !== userId.toString()
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorised" });
    }

    await Chat.findByIdAndDelete(req.params.chatId);
    res.json({ success: true, message: "Chat deleted Successfully" });
  } catch (error) {
    console.error("Delete chat error : ", error);
    res.status(500).json({
      success: false,
      message: "Error fetching chat messages..",
      error: error.message,
    });
  }
});

//to delete a specific message

chatRouter.delete("/:chatId/message/:messageId", async (req, res) => {
  try {
    const userId = req.user._id;
    const chat = await Chat.findById(req.params.chatId);

    if (!chat)
      return res
        .status(404)
        .json({ success: false, message: "Chat not found.." });

    //find message
    const message = chat.messages.id(req.params.messageId);
    if (!message)
      return res
        .status(404)
        .json({ success: false, message: "Message not found.." });

    //Only sender can delete their message

    if (message.sender.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not Authorised to delete this message",
      });
    }
    // Remove message
    chat.messages.pull(req.params.messageId);
    await chat.save();
    res
      .status(200)
      .json({ success: true, message: "Message deleted successfully", chat });
  } catch (error) {
    console.error("Delete Message Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching chat messages..",
      error: error.message,
    });
  }
});

export default chatRouter;
