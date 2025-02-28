import { db } from "../db.js";

// 🔥 Créer un chat s'il n'existe pas
export const createChatIfNotExist = async (chatId: string, userId: string) => {
    let chatSnapshot = await db.collection("chats").doc(chatId).get();
    if (!chatSnapshot.exists) {
        await db.collection("chats").doc(chatId).set({ members: [userId], createdAt: Date.now() });
    }
};

// 🔥 Ajouter un message dans un chat (Firestore)
export const addMessageToChat = async (chatId: string, newMessage: any) => {
    await db.collection("chats").doc(chatId).collection("messages").add(newMessage);
};

// 🔥 Récupérer un message spécifique par son `messageId`
export const getMessagesFromChat = async (chatId: string, messageId: string) => {
    return await db.collection("chats")
        .doc(chatId)
        .collection("messages")
        .where("messageId", "==", messageId)
        .get();
};

// 🔥 Modifier un message dans Firestore
export const updateMessageInFirestore = async (chatId: string, messageId: string, newContent: string) => {
    const messagesSnapshot = await getMessagesFromChat(chatId, messageId);
    if (messagesSnapshot.empty) return false;

    const messageDoc = messagesSnapshot.docs[0];
    await messageDoc.ref.update({ text: newContent });
    return true;
};

// 🔥 Supprimer un message Firestore
export const deleteMessageFromFirestore = async (chatId: string, messageId: string) => {
    const messagesSnapshot = await getMessagesFromChat(chatId, messageId);
    if (messagesSnapshot.empty) return false;

    const messageDoc = messagesSnapshot.docs[0];
    await messageDoc.ref.delete();
    return true;
};
