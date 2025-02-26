import express from "express";
import cors from "cors";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { WebSocketServer, WebSocket } from "ws";
import Redis from "ioredis";
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

// ✅ Connexion sécurisée à Redis avec vérification
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const redis = new Redis(redisUrl);
const pub = new Redis(redisUrl);
const sub = new Redis(redisUrl);

redis.on("connect", () => console.log("✅ Connecté à Redis"));
redis.on("error", (err) => console.error("❌ Erreur Redis :", err));

const wss = new WebSocketServer({ port: 8080 });

// 🔄 Abonnement à Redis Pub/Sub
sub.subscribe("chat");

wss.on("connection", (ws: WebSocket) => {
    console.log("Client connecté");

    // 🔥 Charger les derniers messages depuis Redis (évite erreur TS18048)
    redis.lrange("recent_messages", 0, 9, (err, messages) => {
        if (!err && Array.isArray(messages) && messages.length > 0) {
            messages.reverse().forEach((msg) => ws.send(msg));
        }
    });

    ws.on("message", async (message: string) => {
        const data = JSON.parse(message);
        const { sender, content } = data;

        // 🚀 Publier le message dans Redis Pub/Sub
        pub.publish("chat", JSON.stringify(data));

        // 🔥 Stocker en cache Redis (évite lecture Firestore inutile)
        await redis.lpush("recent_messages", JSON.stringify(data));
        redis.ltrim("recent_messages", 0, 49); // Garde les 50 derniers messages

        // 🔥 Sauvegarde dans Firestore (pour historique)
        db.collection("messages").add({
            sender,
            content,
            timestamp: new Date().toISOString(),
        });
    });

    ws.on("close", () => console.log("Client déconnecté"));
});

// 🚀 Redis diffuse les messages aux clients WebSocket
sub.on("message", (channel, message) => {
    if (channel === "chat") {
        wss.clients.forEach((client: WebSocket) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    }
});

app.get("/", (_req, res) => {
    res.send("🔥 Serveur WebSocket + Firebase + Redis en cours d'exécution !");
});

app.listen(3000, () => console.log("🚀 Serveur backend sur http://localhost:3000"));
