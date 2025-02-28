    import { WebSocket } from "ws";
    import { createChatIfNotExist, addMessageToChat, getMessagesFromChat, updateMessageInFirestore, deleteMessageFromFirestore } from "../services/firebaseService.js";
    import { publishToChannel, pushMessageToCache, updateMessageInCache, removeMessageFromCache } from "../services/redisService.js";
    import { db } from "../db.js";
    import { Request, Response } from "express";

    // 🔥 Gérer l'envoi d'un message
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
            replyTo: replyTo || null
        };

        await addMessageToChat(chatId, newMessage);
        await pushMessageToCache(newMessage);
        publishToChannel("chat", newMessage);
    };
    // 🔥 Gérer la modification d'un message
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

        await updateMessageInFirestore(chatId, messageId, newContent);
        await updateMessageInCache(messageId, newContent);

        publishToChannel("chat", { type: "edit_message", messageId, newContent });
    };

    // 🔥 Gérer la suppression d'un message
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

        await deleteMessageFromFirestore(chatId, messageId);
        await removeMessageFromCache(messageId);

        publishToChannel("chat", { type: "delete_message", messageId });
    };

    export const getConversations = async (req: Request<{ userId: string }>, res: Response) => {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ error: "⚠️ userId est requis" });
        }

        try {
            const conversationsSnapshot = await db.collection("chats")
                .where("members", "array-contains", userId)
                .get();

            if (conversationsSnapshot.empty) {
                console.log(`👤 Aucune conversation trouvée pour ${userId}, création d'une nouvelle.`);

                // ✅ Crée une conversation par défaut
                const defaultChat = {
                    members: [userId, "admin"], // 👤 Ajoute un bot ou un admin
                    createdAt: new Date().toISOString(),
                };

                const chatRef = await db.collection("chats").add(defaultChat);

                return res.json({
                    conversations: [{ chatId: chatRef.id, members: defaultChat.members, unreadCount: 0 }]
                });
            }

            const conversations = conversationsSnapshot.docs.map(doc => ({
                chatId: doc.id,
                ...doc.data(),
                unreadCount: 0
            }));

            res.json({ conversations });

        } catch (error) {
            console.error("❌ Erreur récupération des conversations :", error);
            res.status(500).json({ error: "Erreur serveur" });
        }
    };
