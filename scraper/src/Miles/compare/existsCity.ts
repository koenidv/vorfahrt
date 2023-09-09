import { RedisClientType } from "@redis/client";

export async function existsCity(redis: RedisClientType, milesId: string) {
    const existsCount = await redis.exists(`miles:city:${milesId}`);
    return existsCount === 1;
}