import { auth } from "./db.js";
import express from "express";

const router = express.Router();

// 🔑 Vérification d'un token Firebase via une route API
router.post("/verify", async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ error: "Token manquant" });
    }

    try {
        const decodedToken = await auth.verifyIdToken(token);
        res.json({ message: "✅ Authentification réussie", uid: decodedToken.uid });
    } catch (error) {
        res.status(401).json({ error: "❌ Token invalide" });
    }
});

// 🔥 Fonction pour vérifier un token Firebase (utilisé par WebSocket)
export async function verifyToken(token: string) {
    try {
        return await auth.verifyIdToken(token);
    } catch (error) {
        throw new Error("❌ Token invalide");
    }
}

export default router;
