import { RedisClientType } from "@redis/client";

export async function existsModel(redis: RedisClientType, modelName: string): Promise<number|false> {
    const val = await redis.get(`miles:model:${modelName}`);
    return Number(val) || false;
}