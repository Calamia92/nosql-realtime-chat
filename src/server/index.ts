// server.ts
import express from "express";
import cors from "cors";
import { WebSocketServer, WebSocket } from "ws";
import { redis, sub } from "./services/redisService.ts";
import dotenv from "dotenv";
import { handleSendMessage, handleEditMessage, handleDeleteMessage } from "./controllers/chatController.ts";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// WebSocket Server
const wss = new WebSocketServer({ port: 8080 });
sub.subscribe("chat");

wss.on("connection", async (ws: WebSocket) => {
    const userId = 'user1';  // À remplacer par une logique d'identification réelle
    console.log(`Utilisateur ${userId} connecté`);

    await redis.sadd("online_users", userId);
    console.log(`Utilisateur ${userId} est en ligne`);

    const cachedMessages = await redis.lrange("recent_messages", 0, 9);
    if (cachedMessages.length > 0) {
        ws.send(
            JSON.stringify({ type: "history", messages: cachedMessages.map((msg) => JSON.parse(msg)) })
        );
    }

    ws.on("message", async (message: string) => {
        try {
            const data = JSON.parse(message);
            switch (data.type) {
                case "send_message":
                    await handleSendMessage(data, ws, userId);
                    break;
                case "edit_message":
                    await handleEditMessage(data, ws, userId);
                    break;
                case "delete_message":
                    await handleDeleteMessage(data, ws, userId);
                    break;
                default:
                    ws.send(JSON.stringify({ type: "error", message: "❌ Type de message inconnu" }));
            }
        } catch (error) {
            console.error("❌ Erreur WebSocket :", error);
            ws.send(JSON.stringify({ type: "error", message: "❌ Erreur serveur" }));
        }
    });

    ws.on("close", async () => {
        await redis.srem("online_users", userId);
        console.log(`Utilisateur ${userId} est hors ligne`);
    });
});

sub.on("message", (channel, message) => {
    if (channel === "chat") {
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    }
});

app.listen(3000, () => console.log("🚀 Serveur backend sur http://localhost:3000"));
