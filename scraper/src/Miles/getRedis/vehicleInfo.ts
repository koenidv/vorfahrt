import { RedisClientType } from "@redis/client";

export async function idVehicleMeta(redis: RedisClientType, milesId: number): Promise<number|null> {
    const val = await redis.get(`miles:vehicle:${milesId}`);
    return Number(val) || null;
}

export async function currentVehicleStatus(redis: RedisClientType, id: number): Promise<string|null> {
    const val = await redis.get(`miles:vehicle:${id}:status`);
    return val || null;
}

export async function currentVehicleLat(redis: RedisClientType, id: number): Promise<number> {
    const val = await redis.get(`miles:vehicle:${id}:latitude`);
    return Number(val) || null;
}

export async function currentVehicleLng(redis: RedisClientType, id: number): Promise<number> {
    const val = await redis.get(`miles:vehicle:${id}:longitude`);
    return Number(val) || null;
}

export async function currentVehicleFuelPercentage(redis: RedisClientType, id: number): Promise<number> {
    const val = await redis.get(`miles:vehicle:${id}:fuelPercentage`);
    return Number(val) || null;
}

export async function currentVehicleRange(redis: RedisClientType, id: number): Promise<number|null> {
    const val = await redis.get(`miles:vehicle:${id}:range`);
    return Number(val) || null;
}

export async function currentVehicleIsCharging(redis: RedisClientType, id: number): Promise<boolean|null> {
    const val = await redis.get(`miles:vehicle:${id}:isCharging`);
    return val === "1" ? true : val === "0" ? false : null;
}

export async function currentVehicleCoverageGsm(redis: RedisClientType, id: number): Promise<number|null> {
    const val = await redis.get(`miles:vehicle:${id}:coverageGsm`);
    return Number(val) || null;
}

export async function currentVehicleCoverageSatellites(redis: RedisClientType, id: number): Promise<number|null> {
    const val = await redis.get(`miles:vehicle:${id}:coverageSatellites`);
    return Number(val) || null;
}

export async function currentVehiclePriceId(redis: RedisClientType, id: number): Promise<number|null> {
    const val = await redis.get(`miles:vehicle:${id}:pricingId`);
    return Number(val) || null;
}

export async function currentVehicleCityMilesId(redis: RedisClientType, id: number): Promise<string|null> {
    const val = await redis.get(`miles:vehicle:${id}:cityMilesId`);
    return val || null;
}