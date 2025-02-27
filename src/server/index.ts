import express from "express";
import cors from "cors";
import { WebSocketServer, WebSocket } from "ws";
import { redis, sub } from "./db.js";
import authRoutes from "./auth.js";
import { verifyToken } from "./auth.js";
import { handleSendMessage, handleEditMessage, handleDeleteMessage } from "./message.ts";

const app = express();
app.use(cors());
app.use(express.json());

// 🔑 Routes Auth Firebase
app.use("/auth", authRoutes);

interface CustomWebSocket extends WebSocket {
    isAlive?: boolean;
    userId?: string;
}

const wss = new WebSocketServer({ port: 8080 });
sub.subscribe("chat");

wss.on("connection", async (ws: CustomWebSocket) => {
    ws.isAlive = true;
    ws.on("pong", () => (ws.isAlive = true));

    ws.on("message", async (message: Buffer) => {
        try {
            const data = JSON.parse(message.toString());

            // Authentification Firebase obligatoire avant toute action
            if (data.type === "auth") {
                const decodedToken = await verifyToken(data.token);
                ws.userId = decodedToken.uid;
                await redis.sadd("online_users", ws.userId);
                console.log(`✅ Utilisateur authentifié : ${ws.userId}`);
                return;
            }

            // Vérification que l'utilisateur est authentifié avant d'exécuter une action
            if (!ws.userId) {
                ws.send(JSON.stringify({ type: "error", message: "⚠️ Vous devez être authentifié pour envoyer des messages." }));
                return;
            }

            switch (data.type) {
                case "send_message":
                    await handleSendMessage(data, ws, ws.userId);
                    break;
                case "edit_message":
                    await handleEditMessage(data, ws, ws.userId);
                    break;
                case "delete_message":
                    await handleDeleteMessage(data, ws, ws.userId);
                    break;
                default:
                    ws.send(JSON.stringify({ type: "error", message: "❌ Type de message inconnu" }));
            }
        } catch (error) {
            ws.send(JSON.stringify({ type: "error", message: "❌ Erreur serveur" }));
            ws.close();
        }
    });

    ws.on("close", async () => {
        if (ws.userId) {
            await redis.srem("online_users", ws.userId);
            console.log(`❌ Utilisateur ${ws.userId} déconnecté`);
        }
    });
});


app.listen(3000, () => console.log("🚀 Serveur backend sur http://localhost:3000"));
