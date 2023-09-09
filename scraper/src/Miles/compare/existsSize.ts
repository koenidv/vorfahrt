import { RedisClientType } from "@redis/client";

export async function existsSize(redis: RedisClientType, sizeId: string): Promise<number|false> {
    const val = await redis.get(`miles:size:${sizeId}`);
    return Number(val) || false;
}