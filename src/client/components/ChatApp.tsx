import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.js";

interface ChatAppProps {
  chatId: number;
  onSendMessage: (chatId: number, newMessage: string) => void;
}

const ChatApp: React.FC<ChatAppProps> = ({ chatId, onSendMessage }) => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState<WebSocket | null>(null);

  // 🔄 Fonction pour récupérer les messages depuis Firestore
  const fetchMessages = async () => {
    try {
      const response = await fetch(`http://localhost:3000/chat/messages/${chatId}`);
      const data = await response.json();
      console.log("📥 Messages chargés Firestore :", data.messages);
      setMessages(data.messages);
    } catch (error) {
      console.error("❌ Erreur récupération messages :", error);
    }
  };

  // 🔥 Connexion WebSocket et mise à jour en temps réel
  useEffect(() => {
    if (!currentUser || !chatId) return;

    fetchMessages(); // ✅ Charge Firestore dès le départ

    const newSocket = new WebSocket("ws://localhost:8080");

    newSocket.onopen = async () => {
      const token = await currentUser.getIdToken();
      newSocket.send(JSON.stringify({ type: "auth", token }));
    };

    newSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("📩 Message reçu via WebSocket :", data);

      if (data.type === "message") {
        fetchMessages(); // 🔄 Recharge Firestore après un nouveau message
      }
    };

    newSocket.onerror = (error) => console.error("WebSocket error :", error);
    newSocket.onclose = () => console.log("WebSocket fermé");

    setSocket(newSocket);

    return () => newSocket.close();
  }, [currentUser, chatId]);

  // ✅ Fonction d'envoi de message avec rafraîchissement instantané
  const sendMessage = () => {
    if (!newMessage.trim() || !socket) return;

    const newMsg = {
      type: "send_message",
      senderId: currentUser?.uid,
      content: newMessage,
      chatId,
    };

    socket.send(JSON.stringify(newMsg));

    // ✅ 🔥 Recharge immédiatement les messages après l'envoi
    setTimeout(fetchMessages, 500);

    onSendMessage(chatId, newMessage);
    setNewMessage("");
  };

  return (
      <div className="p-3" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <div className="d-flex align-items-center mb-3">
          <h4>Conversation</h4>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", marginBottom: "20px" }}>
          {messages.map((message, index) => (
              <div key={index} className={`d-flex ${message.senderId === currentUser?.uid ? "justify-content-end" : "justify-content-start"} mb-3`}>
                <div
                    className={`p-2 rounded ${message.senderId === currentUser?.uid ? "bg-primary text-white" : "bg-light"}`}
                    style={{ maxWidth: "75%", wordWrap: "break-word" }}
                >
                  <p className="mb-0">{message.text}</p>
                </div>
              </div>
          ))}
        </div>

        {/* Input */}
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
