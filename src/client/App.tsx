import React, { useState, useEffect } from "react";

const socket = new WebSocket("ws://localhost:8080");

const ChatApp: React.FC = () => {
    const [messages, setMessages] = useState<{ sender: string; content: string }[]>([]);
    const [input, setInput] = useState("");

    useEffect(() => {
        socket.onmessage = (event) => {
            const newMessage = JSON.parse(event.data);
            setMessages((prev) => [...prev, newMessage]);
        };
    }, []);

    const sendMessage = () => {
        if (input.trim()) {
            socket.send(JSON.stringify({ sender: "User", content: input }));
            setInput("");
        }
    };

    return (
        <div>
            <h1>💬 Chat en temps réel</h1>
            <div>
                {messages.map((msg, i) => (
                    <p key={i}><b>{msg.sender}:</b> {msg.content}</p>
                ))}
            </div>
            <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Écris un message..."
            />
            <button onClick={sendMessage}>Envoyer</button>
        </div>
    );
};

export default ChatApp;
