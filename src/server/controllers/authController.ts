import { auth} from "../db.js";
import { Request, Response } from "express";


// Vérification d'un token Firebase via une route API
export const verifyTokenController = async (req: Request, res: Response) => {
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
};

// Fonction pour vérifier un token Firebase (utilisé par WebSocket)
export async function verifyToken(token: string) {
    try {
        return await auth.verifyIdToken(token);
    } catch (error) {
        throw new Error("❌ Token invalide");
    }
}