import React, { useState } from "react";
import { ListGroup, ListGroupItem, Badge, Form, Button, Image } from "react-bootstrap";

const conversations = [
  { id: 1, title: "Alice", lastMessage: "Salut !", unread: 2, favorite: true, avatar: "https://randomuser.me/api/portraits/women/1.jpg" },
  { id: 2, title: "Bob", lastMessage: "On se voit ?", unread: 1, favorite: false, avatar: "https://randomuser.me/api/portraits/men/1.jpg" },
  { id: 3, title: "Équipe", lastMessage: "Réunion à 14h", unread: 0, favorite: true, avatar: "https://randomuser.me/api/portraits/men/2.jpg" },
];

// Définition des props (on reçoit `onSelectChat` depuis `ChatLayout.tsx`)
interface ConversationsProps {
  onSelectChat: (id: number) => void;
}

const Conversations: React.FC<ConversationsProps> = ({ onSelectChat }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "favorites">("all");

  const filteredConversations = conversations.filter((conv) => {
    if (filter === "unread" && conv.unread === 0) return false;
    if (filter === "favorites" && !conv.favorite) return false;
    if (searchQuery && !conv.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      {/* Filtres */}
      <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
        <h4 className="mb-0">Conversations</h4>
        <div>
          <Button variant={filter === "all" ? "primary" : "outline-primary"} size="sm" onClick={() => setFilter("all")} className="mx-1">
            All
          </Button>
          <Button variant={filter === "unread" ? "primary" : "outline-primary"} size="sm" onClick={() => setFilter("unread")} className="mx-1">
            Unread
          </Button>
          <Button variant={filter === "favorites" ? "primary" : "outline-primary"} size="sm" onClick={() => setFilter("favorites")} className="mx-1">
            Favorites
          </Button>
        </div>
      </div>

      {/* Recherche */}
      <Form.Group className="m-3 d-flex align-items-center" style={{ maxWidth: "300px" }}>
        <Form.Control
          type="text"
          placeholder="🔍 Rechercher une conversation ..."
          className="form-control-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            borderRadius: "20px",
            paddingLeft: "35px",
            width: "100%",
            fontSize: "0.9rem",
          }}
        />
      </Form.Group>

      {/* Liste des conversations */}
      <ListGroup variant="flush">
        {filteredConversations.length > 0 ? (
          filteredConversations.map((conversation) => (
            <ListGroupItem
              key={conversation.id}
              className="d-flex justify-content-between align-items-center"
              onClick={() => onSelectChat(conversation.id)} // Sélectionner la conversation
              style={{
                cursor: "pointer",
                borderBottom: "1px solid #ddd",  // Légère séparation entre les éléments
              }}
            >
              <div className="d-flex align-items-center">
                <Image
                  src={conversation.avatar}
                  roundedCircle
                  width={50}
                  height={50}
                  className="mr-3 border border-light"
                  style={{
                    boxShadow: "0 0 5px rgba(0,0,0,0.1)",
                    transition: "transform 0.3s ease",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
                  onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
                />
                <div>
                  <h6>{conversation.title}</h6>
                  <p className="text-muted" style={{ fontSize: "0.85rem" }}>{conversation.lastMessage}</p>
                </div>
              </div>
              {conversation.unread > 0 && (
                <Badge className="bg-success" pill>{conversation.unread}</Badge>
              )}
            </ListGroupItem>
          ))
        ) : (
          <p className="text-center text-muted mt-3">Aucune conversation trouvée</p>
        )}
      </ListGroup>
    </>
  );
};

export default Conversations;
