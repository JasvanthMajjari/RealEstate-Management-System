import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import ChatContext from "./ChatContext";

export const ChatProvider = ({ children }) => {
  const socket = useRef(null);

  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);

  //
  // CONNECT SOCKET
  //
  useEffect(() => {
    socket.current = io(
      "https://realestate-management-system-6msr.onrender.com",
      {
        transports: ["websocket"],
      },
    );

    socket.current.on("connect", () => {
      console.log("Socket Connected:", socket.current.id);
    });

    socket.current.on("disconnect", () => {
      console.log("Socket Disconnected");
    });

    socket.current.on("receiveMessage", (data) => {
      console.log("Received", data);

      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.current.disconnect();
    };
  }, []);

  //
  // JOIN CHAT ROOM
  //
  const joinChat = (chatId) => {
    if (!socket.current) return;

    socket.current.emit("joinChat", chatId);
  };

  //
  // SEND MESSAGE
  //
  const sendMessage = (chatId, text, messageId, createdAt) => {
    if (!socket.current) return;

    socket.current.emit("sendMessage", {
      chatId,
      text,
      _id: messageId,
      createdAt,
    });
  };

  // receive Message

  useEffect(() => {
    if (!socket.current) return;

    socket.current.on("receiveMessage", (data) => {
      console.log(data);
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.current.off("receiveMessage");
    };
  }, [socket]);

  return (
    <ChatContext.Provider
      value={{
        socket,
        activeChat,
        setActiveChat,
        joinChat,
        sendMessage,
        messages,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
