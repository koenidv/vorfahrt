import { RedisClientType } from "@redis/client";

type IdPricingProps = {
    sizeName: string,
    priceKm: number,
    pricePause: number,
    priceUnlock: number,
    pricePreBooking?: number,
}

export async function idPricing(
    redis: RedisClientType,
    props: IdPricingProps
): Promise<number | false> {
    const val = await redis.get(`miles:pricing:${props.sizeName}:${props.priceKm}km_${props.pricePause}min_${props.priceUnlock}x_${props.pricePreBooking}pre`);
    return Number(val) || false;
}

export async function idPricingUndefinedPrebooking(
    redis: RedisClientType,
    props: Pick<IdPricingProps, "sizeName" | "priceKm" | "pricePause" | "priceUnlock">
): Promise<number | false> {
    const val = await redis.get(`miles:pricing:${props.sizeName}:${props.priceKm}km_${props.pricePause}min_${props.priceUnlock}x_undefinedpre`);
    return Number(val) || false;
}