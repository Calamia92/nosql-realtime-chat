// redisService.ts
import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

// Initialisation de Redis
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const redis = new Redis(redisUrl);
const pub = new Redis(redisUrl);
const sub = new Redis(redisUrl);

redis.on("connect", () => console.log("✅ Connecté à Redis"));
redis.on("error", (err) => console.error("❌ Erreur Redis :", err));

export const publishToChannel = (channel: string, message: any) => {
    pub.publish(channel, JSON.stringify(message));
};

export const pushMessageToCache = async (message: any) => {
    await redis.lpush("recent_messages", JSON.stringify(message));
    redis.ltrim("recent_messages", 0, 49);
};

export const updateMessageInCache = async (messageId: string, newContent: string) => {
    const cachedMessages = await redis.lrange("recent_messages", 0, 49);
    let messages = cachedMessages.map((msg) => JSON.parse(msg));
    const index = messages.findIndex((msg: any) => msg.messageId === messageId);
    if (index !== -1) {
        messages[index].text = newContent;
    }
    redis.del("recent_messages");
    messages.forEach((msg) => redis.lpush("recent_messages", JSON.stringify(msg)));
};

export const getRecentMessages = async () => {
    const cachedMessages = await redis.lrange("recent_messages", 0, 9);
    return cachedMessages.map((msg) => JSON.parse(msg));
};

export const removeMessageFromCache = async (messageId: string) => {
    const cachedMessages = await redis.lrange("recent_messages", 0, 49);
    let messages = cachedMessages.map((msg) => JSON.parse(msg));
    messages = messages.filter((msg: any) => msg.messageId !== messageId);
    redis.del("recent_messages");
    messages.forEach((msg) => redis.lpush("recent_messages", JSON.stringify(msg)));
};

export { redis, sub };
