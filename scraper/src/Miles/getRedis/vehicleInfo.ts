import { RedisClientType } from "@redis/client";

export async function idVehicleMeta(redis: RedisClientType, milesId: number): Promise<number|null> {
    const val = await redis.get(`miles:vehicle:${milesId}`);
    return Number(val) || null;
}

// todo find a proper definition on when to use redis