import express from "express";
import { db } from "../db.js";

const router = express.Router();
interface Conversation {
    chatId: string;
    members: string[];
    unreadCount?: number;
}
router.get("/conversations/:userId", async (req, res) => {
    const { userId } = req.params;

    try {
        const chatsSnapshot = await db.collection("chats")
            .where("members", "array-contains", userId)
            .get();

        let conversations: Conversation[] = chatsSnapshot.docs.map((doc) => ({
            chatId: doc.id,
            ...(doc.data() as Omit<Conversation, "chatId">), // 🔥 Assure que `members` existe
        }));

        // 🔥 Si aucune conversation n'existe, en créer une nouvelle
        if (conversations.length === 0) {
            console.log(`👤 Aucune conversation trouvée pour ${userId}, création d'une nouvelle.`);

            const newChatRef = await db.collection("chats").add({
                members: [userId],  // L'utilisateur seul pour le moment
                createdAt: Date.now(),
            });

            conversations = [{
                chatId: newChatRef.id,
                members: [userId],  // ✅ Correction : ajout explicite de `members`
                unreadCount: 0,
            }];
        }

        res.json({ conversations });
    } catch (error) {
        console.error("❌ Erreur lors de la récupération des conversations :", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

router.get("/messages/:chatId", async (req, res) => {
    const { chatId } = req.params;

    try {
        const messagesSnapshot = await db.collection("chats")
            .doc(chatId)
            .collection("messages")
            .orderBy("timestamp", "asc")
            .get();

        const messages = messagesSnapshot.docs.map((doc) => doc.data());

        res.json({ messages });
    } catch (error) {
        console.error("❌ Erreur récupération messages :", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

export default router;