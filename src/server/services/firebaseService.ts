// firebaseService.ts
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import dotenv from "dotenv";

dotenv.config();

// Vérifie si Firebase est déjà initialisé
if (!getApps().length) {
    initializeApp({
        credential: cert('./serviceAccountKey.json'),
    });
} else {
    console.log("Firebase déjà initialisé");
}

const db = getFirestore();

export const createChatIfNotExist = async (chatId: string, userId: string) => {
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

    return chatSnapshot;
};

export const addMessageToChat = async (chatId: string, newMessage: any) => {
    await db.collection("chats").doc(chatId).collection("messages").add(newMessage);
};

export const getMessagesFromChat = async (chatId: string, messageId: string) => {
    const messagesSnapshot = await db
        .collection("chats")
        .doc(chatId)
        .collection("messages")
        .where("messageId", "==", messageId)
        .get();
    return messagesSnapshot;
};
