import { redis, pub } from "../db.js";

// 🚀 Publier un message dans Redis (WebSocket)
export const publishToChannel = (channel: string, message: any) => {
    pub.publish(channel, JSON.stringify(message));
};

// 🚀 Stocker un message dans Redis (cache)
export const pushMessageToCache = async (message: any) => {
    await redis.lpush("recent_messages", JSON.stringify(message));
    redis.ltrim("recent_messages", 0, 49);
};

// 🚀 Modifier un message en cache
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

// 🚀 Supprimer un message du cache Redis
export const removeMessageFromCache = async (messageId: string) => {
    const cachedMessages = await redis.lrange("recent_messages", 0, 49);
    let messages = cachedMessages.map((msg) => JSON.parse(msg));
    messages = messages.filter((msg: any) => msg.messageId !== messageId);
    redis.del("recent_messages");
    messages.forEach((msg) => redis.lpush("recent_messages", JSON.stringify(msg)));
};
