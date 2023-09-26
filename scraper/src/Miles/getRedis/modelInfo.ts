import { RedisClientType } from "@redis/client";

export async function idModel(redis: RedisClientType, modelName: string): Promise<number|false> {
    const val = await redis.get(`miles:model:${modelName}`);
    return Number(val) || false;
    // todo if null, try getting from database
}