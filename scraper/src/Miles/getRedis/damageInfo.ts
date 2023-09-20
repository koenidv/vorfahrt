import { RedisClientType } from "redis";
import insecureHash from "../utils/InsecureHash";

export async function existsDamage(redis: RedisClientType, milesId: string, title: string, damages: string[]): Promise<boolean> {
    const hash = insecureHash(title, JSON.stringify(damages));
    const val = await redis.sIsMember(`miles:vehicle:${milesId}:damages`, hash);
    return val as boolean;
}