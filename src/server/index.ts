import express from "express";
import { WebSocketServer, WebSocket } from "ws";
import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import { handleSendMessage } from "./controllers/chatController.js";
import cors from "cors";
import { sub } from "./db.js";

const app = express();
app.use(express.json());
app.use(cors());
// Routes API
app.use("/auth", authRoutes);
app.use("/chat", chatRoutes); // ✅ Correction ajoutée

// 🚀 Initialisation du WebSocket Server
const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", async (ws: WebSocket) => {
    ws.on("message", async (message: Buffer) => {
        const data = JSON.parse(message.toString());
        if (data.type === "send_message") {
            await handleSendMessage(data, ws, data.userId);
        }
    });
});

// 🔄 Gestion de la diffusion des messages via Redis
sub.on("message", (channel, message) => {
    if (channel === "chat") {
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    }
});

app.listen(3000, () => console.log("🚀 Serveur WebSocket & API sur http://localhost:3000"));
