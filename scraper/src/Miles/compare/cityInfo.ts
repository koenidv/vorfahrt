import { RedisClientType } from "@redis/client";

export async function idCity(redis: RedisClientType, milesId: string): Promise<number|false> {
    const val = await redis.get(`miles:city:${milesId}`);
    return Number(val) || false;
}