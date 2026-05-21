import { useLocation } from "react-router-dom";
import { chatMessagesStyles as s } from "../../assets/dummyStyles";
import { useAuth } from "../../context/useAuth";
import { useChat } from "../../context/useChat";
import { useEffect, useRef, useState } from "react";
import API_URL from "../../config.js";
import Navbar from "../../components/common/Navbar";
import {
  HiChevronLeft,
  HiOutlineChatAlt2,
  HiOutlineTrash,
  HiPaperAirplane,
} from "react-icons/hi";
import api from "../../utils/axios.js";

const ChatMessages = () => {
  const { user, token } = useAuth();
  const location = useLocation();
  const { activeChat, setActiveChat, joinChat, sendMessage } = useChat();
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  //to scroll bottom

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  //to fetch the conversation (b/w buyer and seller)

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        if (!token) {
          console.error("No token found");
          setLoading(false);
          return;
        }
        const res = await api.get(`${API_URL}/api/chat/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const fetchedConversations = res.data;
        setConversations(fetchedConversations);

        const chatFromState = location.state?.chat;

        if (chatFromState) {
          const existingChat = fetchedConversations.find(
            (c) => c._id === chatFromState._id,
          );
          setActiveChat(existingChat || chatFromState);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching conversations.", error);
        setLoading(false);
      }
    };
    fetchConversations();
  }, [token, location.state?.chat, setActiveChat]);

  // to fetch messages

  useEffect(() => {
    if (!activeChat?._id || !token) return;

    const fetchMessages = async () => {
      try {
        const res = await api.get(`${API_URL}/api/chat/${activeChat._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(res.data.messages || []);
        joinChat(activeChat._id);
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      } catch (error) {
        console.error("Error fetching messages: ", error);
      }
    };
    fetchMessages();
  }, [activeChat, token, joinChat]);

  // Updating the chat when new message is received.

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  //to send message

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat?._id || !token) return;
    const textToSend = newMessage;
    setNewMessage("");

    try {
      const res = await api.post(
        `${API_URL}/api/chat/send`,
        { chatId: activeChat._id, text: textToSend },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (res.data.newMessage) {
        //Local update
        setMessages((prev) => [...prev, res.data.newMessage]);

        //socket emit
        sendMessage(
          activeChat._id,
          textToSend,
          res.data.newMessage._id,
          res.data.newMessage.createdAt,
        );
      }
      scrollToBottom();
    } catch (error) {
      console.error("Error sending messages: ", error);
    }
  };

  //to delete a chat

  const handleDeleteChat = async (e, chatId) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this conversation"))
      return;

    try {
      await api.delete(`${API_URL}/api/chat/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConversations((prev) => prev.filter((c) => c._id !== chatId));
      if (activeChat?._id === chatId) setActiveChat(null);
    } catch (error) {
      console.error("Error deleting the chat", error);
    }
  };

  //to delete a particular message

  const handleDeleteMessage = async (chatId, messageId) => {
    if (!window.confirm("Delete this message")) return;

    try {
      const res = await api.delete(
        `${API_URL}/api/chat/${chatId}/message/${messageId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setMessages(res.data.chat.messages);
    } catch (error) {
      console.error("Error deleting message: ", error);
    }
  };

  //to get the partner
  const getChatPartner = (chat) => {
    return user._id == chat.buyer._id ? chat.seller : chat.buyer;
  };

  if (loading)
    return (
      <div className={s.loaderFullPage}>
        <div className={s.loader}></div>
      </div>
    );
  return (
    <div
      className={`${s.chatContainer} ${user?.role === "seller" ? s.chatContainerSeller : s.chatContainerNonSeller}`}
    >
      {user?.role !== "seller" && <Navbar />}

      <div className={s.chatWrapper}>
        <div className={`${s.sidebar} ${activeChat ? s.sidebarHidden : ""}`}>
          <div className={s.sidebarHeader}>
            <h2 className={s.sidebarTitle}>Messages</h2>
          </div>
          <div className={s.sidebarContent}>
            {conversations.length === 0 ? (
              <div className={s.emptyConversations}>
                <HiOutlineChatAlt2 className={s.emptyIcon} />
                <p> No Conversations yet.</p>
              </div>
            ) : (
              conversations.map((chat) => (
                <div
                  key={chat._id}
                  className={`${s.conversationItem} 
                  ${activeChat?._id === chat._id ? s.conversationItemActive : ""}`}
                  onClick={() => setActiveChat(chat)}
                >
                  <div className={s.avatar}>
                    {getChatPartner(chat)?.profilePic ? (
                      <img
                        src={getChatPartner(chat).profilePic}
                        className={s.avatarImg}
                        alt=""
                      />
                    ) : (
                      getChatPartner(chat)?.name?.charAt(0)
                    )}
                  </div>
                  <div className={s.conversationInfo}>
                    <div className={s.conversationName}>
                      {getChatPartner(chat)?.name}
                    </div>
                    <div className={s.conversationPreview}>
                      {Array.isArray(chat.messages) && chat.messages.length > 0
                        ? chat.messages[chat.messages.length - 1]?.text
                        : "Started a conversation"}
                    </div>
                  </div>
                  <button
                    className={s.deleteChatButton}
                    onClick={(e) => handleDeleteChat(e, chat._id)}
                    title="Delete Conversation"
                  >
                    <HiOutlineTrash />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/*main chat area */}
        <div className={s.chatArea}>
          {activeChat ? (
            <>
              <div className={s.chatHeader}>
                <div className={s.chatHeaderLeft}>
                  <button
                    className={s.backButton}
                    onClick={() => setActiveChat(null)}
                  >
                    <HiChevronLeft size={24} />
                  </button>
                  <div className={s.avatar}>
                    {getChatPartner(activeChat)?.profilePic ? (
                      <img
                        className={s.avatarImg}
                        src={getChatPartner(activeChat).profilePic}
                        alt=""
                      />
                    ) : (
                      getChatPartner(activeChat)?.name?.charAt(0)
                    )}
                  </div>
                  <div className={s.chatPartnerName}>
                    {getChatPartner(activeChat)?.name}
                  </div>
                </div>
              </div>

              <div className={s.messagesArea}>
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`${s.messageBubble} ${(msg.sender?._id || msg.sender) === user._id ? s.messageOwn : s.messageOther}`}
                  >
                    <div className={s.messageContent}>
                      {msg.image && (
                        <div className={s.messageImageWrapper}>
                          <img
                            src={msg.image}
                            alt="Property Reference"
                            className={s.messageImage}
                          />
                        </div>
                      )}
                      <div className={s.messageText}>{msg.text}</div>
                      {(msg.sender?._id || msg.sender) === user._id && (
                        <button
                          className={s.deleteMessageButton}
                          onClick={() =>
                            handleDeleteMessage(activeChat._id, msg._id)
                          }
                          title="Delete Message"
                        >
                          <HiOutlineTrash size={14} />
                        </button>
                      )}
                    </div>
                    <span className={s.messageTime}>
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form className={s.messageForm} onSubmit={handleSendMessage}>
                <input
                  type="text"
                  className={s.messageInput}
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button type="submit" className={s.sendButton}>
                  <HiPaperAirplane className={s.sendIcon} />
                </button>
              </form>
            </>
          ) : (
            <div className={s.noChatSelected}>
              <HiOutlineChatAlt2 className={s.noChatIcon} />
              <h3 className={s.noChatTitle}>Your Messages</h3>
              <p>Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessages;
