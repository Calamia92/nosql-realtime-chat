import React, { useState } from "react";

const conversations = [
  {
    id: 1,
    title: "Alice",
    isOnline: true,
    avatar: "https://randomuser.me/api/portraits/women/1.jpg",
    messages: [
      { id: 1, text: "Salut, comment ça va ?", sender: "Alice", timestamp: "10:00" },
      { id: 2, text: "Ça va bien, et toi ?", sender: "Moi", timestamp: "10:02" },
    ],
  },
  {
    id: 2,
    title: "Bob",
    isOnline: false,
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    messages: [
      { id: 1, text: "On se voit ce soir ?", sender: "Bob", timestamp: "18:30" },
      { id: 2, text: "Oui, à quelle heure ?", sender: "Moi", timestamp: "18:32" },
    ],
  },
  {
    id: 3,
    title: "Équipe",
    isOnline: true,
    avatar: "https://randomuser.me/api/portraits/men/2.jpg",
    messages: [
      { id: 1, text: "Réunion à 14h", sender: "Équipe", timestamp: "09:00" },
      { id: 2, text: "Ok, j'y serai.", sender: "Moi", timestamp: "09:05" },
    ],
  },
];

interface ChatAppProps {
  chatId: number;
  onSendMessage: (chatId: number, newMessage: string) => void;
}

const ChatApp: React.FC<ChatAppProps> = ({ chatId, onSendMessage }) => {
  const conversation = conversations.find((conv) => conv.id === chatId);

  if (!conversation) {
    return <div>Aucune conversation trouvée.</div>;
  }

  const [messages, setMessages] = useState(conversation.messages);
  const [newMessage, setNewMessage] = useState("");

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const newMsg = {
      id: messages.length + 1,
      text: newMessage,
      sender: "Moi",
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages([...messages, newMsg]);

    onSendMessage(chatId, newMessage);

    setNewMessage("");
  };

  return (
      <div className="p-3" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <div className="d-flex align-items-center mb-3">
          <img
              src={conversation.avatar}
              alt={conversation.title}
              style={{ width: "40px", height: "40px", borderRadius: "50%", marginRight: "10px" }}
          />
          <div>
            <h4>{conversation.title}</h4>
            <p
                style={{
                  color: conversation.isOnline ? "green" : "gray",
                  fontWeight: "bold",
                }}
            >
              {conversation.isOnline ? "En ligne" : "Hors ligne"}
            </p>
          </div>
        </div>

        {/* Affichage des messages */}
        <div style={{ flex: 1, overflowY: "auto", marginBottom: "20px" }}>
          {messages.map((message) => (
              <div
                  key={message.id}
                  className={`d-flex ${message.sender === "Moi" ? "justify-content-end" : "justify-content-start"} mb-3`}
              >
                <div
                    className={`p-2 rounded ${message.sender === "Moi" ? "bg-primary text-white" : "bg-light"}`}
                    style={{ maxWidth: "75%", wordWrap: "break-word" }}
                >
                  <p className="mb-0" style={{ fontSize: "0.9rem" }}>
                    {message.text}
                  </p>
                  <small className="text-muted">{message.timestamp}</small>
                </div>
              </div>
          ))}
        </div>

        {/* Formulaire d'envoi de message */}
        <div className="d-flex align-items-center">
          <input
              type="text"
              className="form-control"
              placeholder="Écrire un message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              style={{ borderRadius: "20px" }}
          />
          <button className="btn btn-primary ml-2" onClick={sendMessage}>
            Envoyer
          </button>
        </div>
      </div>
  );
};

export default ChatApp;
