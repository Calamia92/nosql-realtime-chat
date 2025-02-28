import express from "express";
import { verifyTokenController } from "../controllers/authController.js";
import {db, redis} from "../db.js";
import {getAuth} from "firebase-admin/auth";
const router = express.Router();

// 🔐 Route pour vérifier le token Firebase
router.post("/verify", verifyTokenController);

router.get("/users/online", async (_req, res) => {
    const onlineUsers = await redis.smembers("online_users");
    res.json({ users: onlineUsers });
});
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "⚠️ Email et mot de passe requis !" });
    }

    try {
        // 🔥 Vérifier l'utilisateur dans Firebase Auth
        const userRecord = await getAuth().getUserByEmail(email);

        // 📌 Vérifier si l'utilisateur existe dans Firestore
        const userDoc = await db.collection("users").doc(userRecord.uid).get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: "⚠️ Utilisateur non trouvé dans Firestore" });
        }

        res.json({
            message: "✅ Connexion réussie",
            user: userDoc.data(),
        });
    } catch (error) {
        console.error("❌ Erreur de connexion :", error);
        res.status(500).json({ error: "Erreur de connexion" });
    }
});

router.post("/signup", async (req, res) => {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
        return res.status(400).json({ error: "⚠️ Tous les champs sont requis !" });
    }

    try {
        // 🔥 Création de l'utilisateur dans Firebase Auth
        const userRecord = await getAuth().createUser({
            email,
            password,
            displayName: username,
        });

        // 📌 Ajouter l'utilisateur dans Firestore après l'inscription
        await db.collection("users").doc(userRecord.uid).set({
            uid: userRecord.uid,
            email: userRecord.email,
            username: userRecord.displayName,
            createdAt: Date.now(),
        });

        res.json({
            message: "✅ Utilisateur inscrit avec succès",
            uid: userRecord.uid,
        });
    } catch (error) {
        console.error("❌ Erreur d'inscription :", error);
        res.status(500).json({ error: "Erreur d'inscription" });
    }
});
export default router;
