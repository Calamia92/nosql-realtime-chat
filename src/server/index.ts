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

initializeApp({
    credential: cert("./serviceAccountKey.json"),
});
const db = getFirestore();

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const redis = new Redis(redisUrl);
const pub = new Redis(redisUrl);
const sub = new Redis(redisUrl);

redis.on("connect", () => console.log("✅ Connecté à Redis"));
redis.on("error", (err) => console.error("❌ Erreur Redis :", err));

const wss = new WebSocketServer({ port: 8080 });
sub.subscribe("chat");

wss.on("connection", async (ws: WebSocket) => {
    const userId = ws.protocol;

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

async function handleSendMessage(data: any, ws: WebSocket, userId: string) {
    const { senderId, content, chatId, replyTo } = data;

    if (!senderId || !content) {
        ws.send(JSON.stringify({ type: "error", message: "⚠️ Données invalides" }));
        return;
    }

    let chatSnapshot = await db.collection("chats").doc(chatId).get();
    if (!chatSnapshot.exists) {
        const newChat = { members: [userId], createdAt: Date.now() };
        await db.collection("chats").doc(chatId).set(newChat);
        chatSnapshot = await db.collection("chats").doc(chatId).get();
    }

    const chatData = chatSnapshot.data();
    const members = chatData?.members || [];

    if (!members.includes(userId)) {
        await db.collection("chats").doc(chatId).update({ members: [...members, userId] });
    }

    const newMessage = {
        messageId: `msg${Date.now()}`,
        senderId,
        text: content,
        timestamp: Date.now(),
        status: "sent",
        replyTo: replyTo || null,
        attachments: [],
    };

    pub.publish("chat", JSON.stringify(newMessage));
    await redis.lpush("recent_messages", JSON.stringify(newMessage));
    redis.ltrim("recent_messages", 0, 49);

    await db.collection("chats").doc(chatId).collection("messages").add(newMessage);
}

async function handleEditMessage(data: any, ws: WebSocket, userId: string) {
    const { messageId, newContent, chatId } = data;

    if (!messageId || !newContent || !chatId) {
        ws.send(JSON.stringify({ type: "error", message: "⚠️ ID et contenu requis" }));
        return;
    }

    const messagesSnapshot = await db
        .collection("chats")
        .doc(chatId)
        .collection("messages")
        .where("messageId", "==", messageId)
        .get();

    if (messagesSnapshot.empty) {
        ws.send(JSON.stringify({ type: "error", message: "⚠️ Message non trouvé" }));
        return;
    }

    const messageDoc = messagesSnapshot.docs[0];
    const messageData = messageDoc.data();

    if (messageData.senderId !== userId) {
        ws.send(JSON.stringify({ type: "error", message: "⚠️ Vous n'êtes pas autorisé à modifier ce message" }));
        return;
    }

    await messageDoc.ref.update({ text: newContent });

    const cachedMessages = await redis.lrange("recent_messages", 0, 49);
    let messages = cachedMessages.map((msg) => JSON.parse(msg));
    const index = messages.findIndex((msg: any) => msg.messageId === messageId);
    if (index !== -1) {
        messages[index].text = newContent;
    }
    redis.del("recent_messages");
    messages.forEach((msg) => redis.lpush("recent_messages", JSON.stringify(msg)));

    pub.publish("chat", JSON.stringify({ type: "edit_message", messageId, newContent }));
}

async function handleDeleteMessage(data: any, ws: WebSocket, userId: string) {
    const { messageId, chatId } = data;

    if (!messageId || !chatId) {
        ws.send(JSON.stringify({ type: "error", message: "⚠️ ID requis" }));
        return;
    }

    const messagesSnapshot = await db
        .collection("chats")
        .doc(chatId)
        .collection("messages")
        .where("messageId", "==", messageId)
        .get();

    if (messagesSnapshot.empty) {
        ws.send(JSON.stringify({ type: "error", message: "⚠️ Message non trouvé" }));
        return;
    }

    const messageDoc = messagesSnapshot.docs[0];
    const messageData = messageDoc.data();

    if (messageData.senderId !== userId) {
        ws.send(JSON.stringify({ type: "error", message: "⚠️ Vous n'êtes pas autorisé à supprimer ce message" }));
        return;
    }

    await messageDoc.ref.delete();

    const cachedMessages = await redis.lrange("recent_messages", 0, 49);
    let messages = cachedMessages.map((msg) => JSON.parse(msg));
    messages = messages.filter((msg: any) => msg.messageId !== messageId);
    redis.del("recent_messages");
    messages.forEach((msg) => redis.lpush("recent_messages", JSON.stringify(msg)));

    pub.publish("chat", JSON.stringify({ type: "delete_message", messageId }));
}

app.get("/", (_req, res) => {
    res.send("🔥 Serveur WebSocket + Firebase + Redis en cours d'exécution !");
});

app.listen(3000, () => console.log("🚀 Serveur backend sur http://localhost:3000"));
