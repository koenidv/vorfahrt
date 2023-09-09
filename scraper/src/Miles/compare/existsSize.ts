import { RedisClientType } from "@redis/client";

export async function existsSize(redis: RedisClientType, sizeId: string) {
    const existsCount = await redis.exists(`miles:size:${sizeId}`);
    return existsCount === 1;
}