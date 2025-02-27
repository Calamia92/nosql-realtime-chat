import React, { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import Conversations from "./Conversations";
import ChatApp from "./ChatApp"; // Composant qui affiche les messages de la conversation

const ChatLayout: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState<number | null>(null); // État pour la conversation sélectionnée

  // Gérer l'envoi d'un message
  const handleSendMessage = (chatId: number, newMessage: string) => {
    // Ici, tu ajouteras la logique pour envoyer un message
    console.log(`Message envoyé à la conversation ${chatId}: ${newMessage}`);
  };

  return (
    <Container fluid style={{ minHeight: "100vh", padding: "10px" }}>
      <Row className="h-100">
        <Col md={3} className="d-flex flex-column" style={{ backgroundColor: "#fff", borderRadius: "10px" }}>
          <Conversations onSelectChat={setSelectedChat} /> {/* Passe `setSelectedChat` à `Conversations` */}
        </Col>

        <Col md={8} lg={9} className="d-flex flex-column" style={{ backgroundColor: "#f9f9f9", borderRadius: "20px", minHeight: "1000px" }}>
          {selectedChat ? (
            <ChatApp chatId={selectedChat} onSendMessage={handleSendMessage} /> // Affiche la conversation sélectionnée
          ) : (
            <p className="text-center mt-5">Sélectionnez une conversation</p>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ChatLayout;
