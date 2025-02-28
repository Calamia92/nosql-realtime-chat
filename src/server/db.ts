import { initializeApp, cert, getApps, getApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { Redis } from "ioredis";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

dotenv.config();

const serviceAccountPath = path.resolve(process.cwd(), "serviceAccountKey.json");

// ✅ Vérifie si le fichier existe bien
if (!fs.existsSync(serviceAccountPath)) {
    console.error("❌ ERREUR: Fichier serviceAccountKey.json introuvable !");
    process.exit(1); // Arrête le serveur
}

// ✅ Vérifie si Firebase est déjà initialisé
if (!getApps().length) {
    initializeApp({
        credential: cert(serviceAccountPath),
    });
} else {
    console.log("✅ Firebase déjà initialisé");
}

// 🔥 Récupérer Firestore et Auth de l'application Firebase existante
export const db = getFirestore(getApp());
export const auth = getAuth(getApp());

// 🚀 Connexion à Redis
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
export const redis = new Redis(redisUrl);
export const pub = new Redis(redisUrl);
export const sub = new Redis(redisUrl);

redis.on("connect", () => console.log("✅ Connecté à Redis"));
redis.on("error", (err: Error) => console.error("❌ Erreur Redis :", err));
