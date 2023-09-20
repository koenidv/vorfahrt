import { RedisClientType } from "@redis/client";

export async function idSize(redis: RedisClientType, sizeId: string): Promise<number|false> {
    const val = await redis.get(`miles:size:${sizeId}`);
    return Number(val) || false;
}