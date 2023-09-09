import { RedisClientType } from "@redis/client";


export async function existsVehicle(redis: RedisClientType, milesId: number): Promise<boolean> {
    return idVehicleMeta(redis, milesId) !== null;
}

export async function idVehicleMeta(redis: RedisClientType, milesId: number): Promise<number|null> {
    const val = await redis.get(`miles:vehicle:${milesId}`);
    return Number(val) || null;
}

export async function currentVehicleStatus(redis: RedisClientType, id: number): Promise<string|null> {
    const val = await redis.get(`miles:vehicle:${id}:status`);
    return val;
}

export async function currentVehicleLat(redis: RedisClientType, id: number): Promise<number> {
    const val = await redis.get(`miles:vehicle:${id}:latitude`);
    return Number(val) || 0;
}

export async function currentVehicleLng(redis: RedisClientType, id: number): Promise<number> {
    const val = await redis.get(`miles:vehicle:${id}:longitude`);
    return Number(val) || 0;
}

export async function currentVehicleFuelPercentage(redis: RedisClientType, id: number): Promise<number> {
    const val = await redis.get(`miles:vehicle:${id}:fuelPercentage`);
    return Number(val) || 0;
}

export async function currentVehicleRange(redis: RedisClientType, id: number): Promise<number> {
    const val = await redis.get(`miles:vehicle:${id}:range`);
    return Number(val) || 0;
}

export async function currentVehicleIsCharging(redis: RedisClientType, id: number): Promise<boolean> {
    const val = await redis.get(`miles:vehicle:${id}:isCharging`);
    return val === "1";
}

export async function currentVehicleCoverageGsm(redis: RedisClientType, id: number): Promise<number> {
    const val = await redis.get(`miles:vehicle:${id}:coverageGsm`);
    return Number(val) || 0;
}

export async function currentVehicleCoverageSatellites(redis: RedisClientType, id: number): Promise<number> {
    const val = await redis.get(`miles:vehicle:${id}:coverageSatellites`);
    return Number(val) || 0;
}

export async function currentVehiclePriceKm(redis: RedisClientType, id: number): Promise<number> {
    const val = await redis.get(`miles:vehicle:${id}:priceKm`);
    return Number(val) || 0;
}

export async function currentVehiclePriceParking(redis: RedisClientType, id: number): Promise<number> {
    const val = await redis.get(`miles:vehicle:${id}:priceParking`);
    return Number(val) || 0;
}

export async function currentVehiclePriceUnlock(redis: RedisClientType, id: number): Promise<number> {
    const val = await redis.get(`miles:vehicle:${id}:priceUnlock`);
    return Number(val) || 0;
}

export async function currentVehiclePricePreBooking(redis: RedisClientType, id: number): Promise<number> {
    const val = await redis.get(`miles:vehicle:${id}:pricePreBooking`);
    return Number(val) || 0;
}

export async function currentVehicleCityMilesId(redis: RedisClientType, id: number): Promise<string|null> {
    const val = await redis.get(`miles:vehicle:${id}:cityMilesId`);
    return val;
}