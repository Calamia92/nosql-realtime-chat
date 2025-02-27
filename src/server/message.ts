import { db, redis, pub } from "./db.js";
import { WebSocket } from "ws";

export async function handleSendMessage(data: any, ws: WebSocket, userId: string) {
    const { senderId, content, chatId, replyTo } = data;

    if (!senderId || !content) {
        ws.send(JSON.stringify({ type: "error", message: "⚠️ Données invalides" }));
        return;
    }

    let chatSnapshot = await db.collection("chats").doc(chatId).get();
    if (!chatSnapshot.exists) {
        const newChat = { members: [userId], createdAt: Date.now() };
        await db.collection("chats").doc(chatId).set(newChat);
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

export async function handleEditMessage(data: any, ws: WebSocket, userId: string) {
    const { messageId, newContent, chatId } = data;

    if (!messageId || !newContent || !chatId) {
        ws.send(JSON.stringify({ type: "error", message: "⚠️ ID et contenu requis" }));
        return;
    }

    const messagesSnapshot = await db.collection("chats")
        .doc(chatId).collection("messages")
        .where("messageId", "==", messageId).get();

    if (messagesSnapshot.empty) {
        ws.send(JSON.stringify({ type: "error", message: "⚠️ Message non trouvé" }));
        return;
    }

    const messageDoc = messagesSnapshot.docs[0];
    const messageData = messageDoc.data();

    // 🔒 Vérifie que l'utilisateur est bien l'auteur du message
    if (messageData.senderId !== userId) {
        ws.send(JSON.stringify({ type: "error", message: "⚠️ Vous ne pouvez modifier que vos propres messages." }));
        return;
    }

    // 📝 Met à jour le message
    await messageDoc.ref.update({ text: newContent });

    // 🔔 Notifie les autres utilisateurs via WebSocket
    pub.publish("chat", JSON.stringify({ type: "edit_message", messageId, newContent }));
}


export async function handleDeleteMessage(data: any, ws: WebSocket, userId: string) {
    const { messageId, chatId } = data;

    if (!messageId || !chatId) {
        ws.send(JSON.stringify({ type: "error", message: "⚠️ ID requis" }));
        return;
    }

    // 🔍 Rechercher le message dans Firestore
    const messagesSnapshot = await db.collection("chats")
        .doc(chatId).collection("messages")
        .where("messageId", "==", messageId).get();

    if (messagesSnapshot.empty) {
        ws.send(JSON.stringify({ type: "error", message: "⚠️ Message non trouvé" }));
        return;
    }

    const messageDoc = messagesSnapshot.docs[0];
    const messageData = messageDoc.data();

    // 🔒 Vérification de l'autorisation (seul l'auteur peut supprimer)
    if (messageData.senderId !== userId) {
        ws.send(JSON.stringify({ type: "error", message: "⚠️ Vous n'êtes pas autorisé à supprimer ce message" }));
        return;
    }

    // 🗑️ Supprimer le message de Firestore
    await messageDoc.ref.delete();

    // 🔄 Mettre à jour le cache Redis en retirant le message
    const cachedMessages = await redis.lrange("recent_messages", 0, 49);
    let messages = cachedMessages.map((msg) => JSON.parse(msg));
    messages = messages.filter((msg: any) => msg.messageId !== messageId);

    redis.del("recent_messages");
    messages.forEach((msg) => redis.lpush("recent_messages", JSON.stringify(msg)));

    // 🔔 Notifier les autres clients WebSocket
    pub.publish("chat", JSON.stringify({ type: "delete_message", messageId }));
}


export const publishToChannel = (channel: string, message: any) => {
    pub.publish(channel, JSON.stringify(message));
};

export const pushMessageToCache = async (message: any) => {
    await redis.lpush("recent_messages", JSON.stringify(message));
    redis.ltrim("recent_messages", 0, 49);
};

export const updateMessageInCache = async (messageId: string, newContent: string) => {
    const cachedMessages = await redis.lrange("recent_messages", 0, 49);
    let messages = cachedMessages.map((msg) => JSON.parse(msg));
    const index = messages.findIndex((msg: any) => msg.messageId === messageId);
    if (index !== -1) {
        messages[index].text = newContent;
    }
    redis.del("recent_messages");
    messages.forEach((msg) => redis.lpush("recent_messages", JSON.stringify(msg)));
};

export const getRecentMessages = async () => {
    const cachedMessages = await redis.lrange("recent_messages", 0, 9);
    return cachedMessages.map((msg) => JSON.parse(msg));
};

export const removeMessageFromCache = async (messageId: string) => {
    const cachedMessages = await redis.lrange("recent_messages", 0, 49);
    let messages = cachedMessages.map((msg) => JSON.parse(msg));
    messages = messages.filter((msg: any) => msg.messageId !== messageId);
    redis.del("recent_messages");
    messages.forEach((msg) => redis.lpush("recent_messages", JSON.stringify(msg)));
};
