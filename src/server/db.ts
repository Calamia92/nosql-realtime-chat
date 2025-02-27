import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { Redis } from "ioredis";
import dotenv from "dotenv";

dotenv.config();

// 🔥 Initialisation de Firebase
initializeApp({
    credential: cert("./serviceAccountKey.json"),
});
const db = getFirestore();
const auth = getAuth();

// 🚀 Connexion à Redis
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const redis = new Redis(redisUrl);
const pub = new Redis(redisUrl);
const sub = new Redis(redisUrl);

redis.on("connect", () => console.log("✅ Connecté à Redis"));
redis.on("error", (err) => console.error("❌ Erreur Redis :", err));

export { db, auth, redis, pub, sub };
