import React, { useEffect, useState } from "react";
import { ListGroup, ListGroupItem, Badge } from "react-bootstrap";
import {useAuth} from "../../context/AuthContext.js";

interface ConversationsProps {
    onSelectChat: (id: number) => void;
}

const Conversations: React.FC<ConversationsProps> = ({ onSelectChat }) => {
    const { currentUser } = useAuth();
    const [conversations, setConversations] = useState<any[]>([]);

    useEffect(() => {
        if (!currentUser) return;

        console.log("📩 Chargement des conversations pour :", currentUser.uid);

        fetch(`http://localhost:3000/chat/conversations/${currentUser.uid}`)
            .then((res) => res.json())
            .then((data) => {
                setConversations(data.conversations);
                if (data.conversations.length > 0) {
                    onSelectChat(data.conversations[0].chatId); // Sélectionne la première conversation automatiquement
                }
            })
            .catch((error) => console.error("❌ Erreur récupération conversations :", error));
    }, [currentUser]);;

    return (
        <ListGroup>
            {conversations.map((conv) => (
                <ListGroupItem key={conv.chatId} onClick={() => onSelectChat(conv.chatId)} style={{ cursor: "pointer" }}>
                    <div className="d-flex justify-content-between align-items-center">
                        <h6>{conv.chatId}</h6>
                        {conv.unreadCount > 0 && <Badge bg="success">{conv.unreadCount}</Badge>}
                    </div>
                </ListGroupItem>
            ))}
        </ListGroup>
    );
};

export default Conversations;
