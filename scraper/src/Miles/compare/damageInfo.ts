import { RedisClientType } from "redis";
import { insecureHash } from "../insert/utils";

export async function existsDamage(redis: RedisClientType, milesId: string, title: string, damages: string): Promise<boolean> {
    const hash = insecureHash(title, damages);
    const val = await redis.sIsMember(`miles:vehicle:${milesId}:damages`, hash);
    return val as boolean;
}