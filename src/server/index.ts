import express from "express";
import cors from "cors";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { WebSocketServer, WebSocket } from "ws";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 🔥 Initialisation Firebase
initializeApp({
    credential: cert("./serviceAccountKey.json"),
});
const db = getFirestore();

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (ws: WebSocket) => {
    console.log("Client connecté");

    ws.on("message", async (message: string) => {
        const data = JSON.parse(message);
        const { sender, content } = data;

        // 🔥 Sauvegarde du message dans Firestore
        const newMessage = {
            sender,
            content,
            timestamp: new Date().toISOString(),
        };
        await db.collection("messages").add(newMessage);

        // 🔄 Broadcast à tous les clients connectés
        wss.clients.forEach((client: WebSocket) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(newMessage));
            }
        });
    });

    ws.on("close", () => console.log("Client déconnecté"));
});

app.get("/", (_req, res) => {
    res.send("🔥 Serveur WebSocket + Firebase en cours d'exécution !");
});

app.listen(3000, () => console.log("🚀 Serveur backend sur http://localhost:3000"));
