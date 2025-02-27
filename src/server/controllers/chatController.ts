// chatController.ts
import { WebSocket } from "ws";
import { createChatIfNotExist, addMessageToChat, getMessagesFromChat } from "../services/firebaseService.ts";
import { publishToChannel, pushMessageToCache, updateMessageInCache, removeMessageFromCache } from '../message.ts';

// Fonction pour envoyer un message
export const handleSendMessage = async (data: any, ws: WebSocket, userId: string) => {
    const { senderId, content, chatId, replyTo } = data;

    if (!senderId || !content || !chatId) {
        ws.send(JSON.stringify({ type: "error", message: "⚠️ Données invalides" }));
        return;
    }

    await createChatIfNotExist(chatId, userId);

    const newMessage = {
        messageId: `msg${Date.now()}`,
        senderId,
        text: content,
        timestamp: Date.now(),
        status: "sent",
        replyTo: replyTo || null,
        attachments: [],
    };

    publishToChannel("chat", newMessage);
    await pushMessageToCache(newMessage);

    await addMessageToChat(chatId, newMessage);
};

// Fonction pour éditer un message
export const handleEditMessage = async (data: any, ws: WebSocket, userId: string) => {
    const { messageId, newContent, chatId } = data;

    if (!messageId || !newContent || !chatId) {
        ws.send(JSON.stringify({ type: "error", message: "⚠️ ID et contenu requis" }));
        return;
    }

    const messagesSnapshot = await getMessagesFromChat(chatId, messageId);

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
    await updateMessageInCache(messageId, newContent);

    publishToChannel("chat", { type: "edit_message", messageId, newContent });
};

// Fonction pour supprimer un message
export const handleDeleteMessage = async (data: any, ws: WebSocket, userId: string) => {
    const { messageId, chatId } = data;

    if (!messageId || !chatId) {
        ws.send(JSON.stringify({ type: "error", message: "⚠️ ID requis" }));
        return;
    }

    const messagesSnapshot = await getMessagesFromChat(chatId, messageId);

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
    await removeMessageFromCache(messageId);

    publishToChannel("chat", { type: "delete_message", messageId });
};
