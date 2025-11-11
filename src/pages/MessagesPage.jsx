import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../integrations/supabase/client.js";
import { useAuth } from "../components/App.jsx";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import "../styles/MessagesPage.css";

const MessagesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showConversations, setShowConversations] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContentRef = useRef(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchConversations();
  }, [user, navigate]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(
        selectedConversation.otherUserId,
        selectedConversation.listingId
      );
      markMessagesAsRead(
        selectedConversation.otherUserId,
        selectedConversation.listingId
      );
      window.dispatchEvent(new CustomEvent("messagesRead"));
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesContentRef.current) {
      messagesContentRef.current.scrollTop =
        messagesContentRef.current.scrollHeight;
    }
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);

      const { data: messagesData, error } = await supabase
        .from("messages_2025_10_29_18_05")
        .select(
          `
          *,
          sender:profiles_2025_10_29_18_05!sender_id(full_name, avatar_url),
          receiver:profiles_2025_10_29_18_05!receiver_id(full_name, avatar_url),
          listings_2025_10_29_18_05(title, fruit_type)
        `
        )
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const conversationsMap = new Map();

      messagesData?.forEach((message) => {
        const otherUserId =
          message.sender_id === user.id
            ? message.receiver_id
            : message.sender_id;
        const listingId = message.listing_id || "general";

        // Créer une clé unique pour la conversation
        const conversationKey = `${otherUserId}-${listingId}`;

        if (!conversationsMap.has(conversationKey)) {
          conversationsMap.set(conversationKey, {
            id: conversationKey,
            otherUser:
              message.sender_id === user.id ? message.receiver : message.sender,
            otherUserId: otherUserId,
            listingId: listingId,
            listing: message.listings_2025_10_29_18_05,
            lastMessage: message,
            unreadCount: 0,
          });
        }

        const conversation = conversationsMap.get(conversationKey);
        if (
          new Date(message.created_at) >
          new Date(conversation.lastMessage.created_at)
        ) {
          conversation.lastMessage = message;
        }

        if (!message.is_read && message.receiver_id === user.id) {
          conversation.unreadCount++;
        }
      });

      setConversations(Array.from(conversationsMap.values()));
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (otherUserId, listingId) => {
    try {
      console.log("Fetching messages for:", {
        otherUserId,
        listingId,
        currentUserId: user.id,
      });

      let query = supabase
        .from("messages_2025_10_29_18_05")
        .select(
          `
          *,
          sender:profiles_2025_10_29_18_05!sender_id(full_name, avatar_url)
        `
        )
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`
        )
        .order("created_at", { ascending: true });

      if (listingId && listingId !== "general") {
        query = query.eq("listing_id", listingId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      console.log("Fetched messages:", data);
      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const markMessagesAsRead = async (otherUserId, listingId) => {
    try {
      let query = supabase
        .from("messages_2025_10_29_18_05")
        .update({ is_read: true })
        .eq("receiver_id", user.id)
        .eq("sender_id", otherUserId)
        .eq("is_read", false);

      if (listingId && listingId !== "general") {
        query = query.eq("listing_id", listingId);
      }

      const { error } = await query;
      if (error) throw error;

      // Mettre à jour le compteur local
      setConversations((prev) =>
        prev.map((conv) =>
          conv.otherUserId === otherUserId && conv.listingId === listingId
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      );
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    setSendingMessage(true);
    try {
      const messageData = {
        sender_id: user.id,
        receiver_id: selectedConversation.otherUserId,
        content: newMessage.trim(),
        listing_id:
          selectedConversation.listingId !== "general"
            ? selectedConversation.listingId
            : null,
        is_read: false,
      };

      console.log("Sending message with data:", messageData);

      const { data, error } = await supabase
        .from("messages_2025_10_29_18_05")
        .insert(messageData)
        .select(
          `
          *,
          sender:profiles_2025_10_29_18_05!sender_id(full_name, avatar_url)
        `
        )
        .single();

      if (error) {
        console.error("Supabase insert error:", error);
        throw error;
      }

      setMessages((prev) => [...prev, data]);
      setNewMessage("");

      // Mettre à jour la conversation
      setConversations((prev) =>
        prev.map((conv) =>
          conv.otherUserId === selectedConversation.otherUserId &&
          conv.listingId === selectedConversation.listingId
            ? { ...conv, lastMessage: data, unreadCount: 0 }
            : conv
        )
      );
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Erreur lors de l'envoi du message");
    } finally {
      setSendingMessage(false);
    }
  };

  const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 168) {
      return date.toLocaleDateString("fr-FR", {
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.otherUser?.full_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      conv.listing?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.lastMessage?.content
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const toggleConversations = () => {
    setShowConversations(!showConversations);
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    setShowConversations(false);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Chargement des messages...</p>
      </div>
    );
  }

  return (
    <div className="messages-page">
      <Header />

      <main className="main-content">
        <div className="container">
          <div className="messages-header-section">
            <h1>Mes messages</h1>
            <p>Gérez vos conversations avec les autres utilisateurs</p>
          </div>

          <div className="messages-container">
            {/* Sidebar des conversations */}
            <div
              className={`conversations-sidebar ${
                showConversations ? "active" : ""
              }`}
            >
              <div className="sidebar-header">
                <div className="sidebar-header-top">
                  <h2>Conversations</h2>
                  <button
                    className="close-sidebar"
                    onClick={() => setShowConversations(false)}
                  >
                    ×
                  </button>
                </div>
                <div className="search-container">
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                  <span className="search-icon">🔍</span>
                </div>
              </div>

              <div className="conversations-list">
                {filteredConversations.length > 0 ? (
                  filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`conversation-item ${
                        selectedConversation?.id === conversation.id
                          ? "active"
                          : ""
                      } ${conversation.unreadCount > 0 ? "unread" : ""}`}
                      onClick={() => handleSelectConversation(conversation)}
                    >
                      <div className="conversation-avatar">
                        {conversation.otherUser?.avatar_url ? (
                          <img
                            src={conversation.otherUser.avatar_url}
                            alt="Avatar"
                          />
                        ) : (
                          <span>👤</span>
                        )}
                        {conversation.unreadCount > 0 && (
                          <span className="online-indicator"></span>
                        )}
                      </div>

                      <div className="conversation-info">
                        <div className="conversation-header">
                          <h4>
                            {conversation.otherUser?.full_name || "Utilisateur"}
                          </h4>
                          <span className="conversation-time">
                            {formatMessageTime(
                              conversation.lastMessage.created_at
                            )}
                          </span>
                        </div>

                        {conversation.listing && (
                          <div className="conversation-listing">
                            🍓 {conversation.listing.title}
                          </div>
                        )}

                        <div className="conversation-preview">
                          <span
                            className={`last-message ${
                              conversation.unreadCount > 0 ? "unread" : ""
                            }`}
                          >
                            {conversation.lastMessage.sender_id === user.id
                              ? "Vous: "
                              : ""}
                            {conversation.lastMessage.content.length > 35
                              ? `${conversation.lastMessage.content.substring(
                                  0,
                                  35
                                )}...`
                              : conversation.lastMessage.content}
                          </span>
                          {conversation.unreadCount > 0 && (
                            <span className="unread-badge">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-conversations">
                    <span className="no-conversations-icon">💬</span>
                    <p>Aucune conversation</p>
                    <small>
                      {searchTerm
                        ? "Aucun résultat pour votre recherche"
                        : "Contactez un propriétaire depuis une annonce pour commencer une conversation"}
                    </small>
                  </div>
                )}
              </div>
            </div>

            {/* Zone principale des messages */}
            <div className="messages-main">
              {selectedConversation ? (
                <>
                  <div className="messages-header">
                    <div className="chat-user-info">
                      <button
                        className="back-button"
                        onClick={toggleConversations}
                      >
                        ☰
                      </button>
                      <div className="chat-avatar">
                        {selectedConversation.otherUser?.avatar_url ? (
                          <img
                            src={selectedConversation.otherUser.avatar_url}
                            alt="Avatar"
                          />
                        ) : (
                          <span>👤</span>
                        )}
                      </div>
                      <div className="chat-details">
                        <h3>
                          {selectedConversation.otherUser?.full_name ||
                            "Utilisateur"}
                        </h3>
                        {selectedConversation.listing && (
                          <p>
                            À propos de: {selectedConversation.listing.title}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="messages-content" ref={messagesContentRef}>
                    {messages.length > 0 ? (
                      <>
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`message ${
                              message.sender_id === user.id
                                ? "sent"
                                : "received"
                            }`}
                          >
                            <div className="message-bubble">
                              <p>{message.content}</p>
                              <span className="message-time">
                                {formatMessageTime(message.created_at)}
                              </span>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </>
                    ) : (
                      <div className="no-messages">
                        <span className="no-messages-icon">💭</span>
                        <p>Aucun message échangé</p>
                        <small>Soyez le premier à envoyer un message !</small>
                      </div>
                    )}
                  </div>

                  <form onSubmit={sendMessage} className="message-form">
                    <div className="message-input-container">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Tapez votre message..."
                        disabled={sendingMessage}
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim() || sendingMessage}
                        className="send-button"
                      >
                        {sendingMessage ? (
                          <div className="send-spinner"></div>
                        ) : (
                          "📤"
                        )}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="no-conversation-selected">
                  <div className="no-conversation-content">
                    <span className="no-conversation-icon">💬</span>
                    <h3>Sélectionnez une conversation</h3>
                    <p>
                      Choisissez une conversation dans la liste pour commencer à
                      échanger
                    </p>
                    <button
                      className="btn btn-primary"
                      onClick={toggleConversations}
                    >
                      Voir les conversations
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MessagesPage;
