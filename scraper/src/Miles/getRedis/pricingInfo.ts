import { RedisClientType } from "redis";

export async function idPricing(
    redis: RedisClientType,
    sizeName: string,
    priceKm: string,
    pricePause: string,
    priceUnlock: string,
    pricePreBooking?: string
): Promise<number | false> {
    const val = await redis.get(`miles:pricing:${sizeName}:${priceKm}km_${pricePause}min_${priceUnlock}x_${pricePreBooking}pre`);
    return Number(val) || false;
}