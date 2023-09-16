import { EntityManager, Point } from "typeorm";
import { RedisClientType } from "@redis/client";
import { City } from "../../entity/Miles/City";
import { createPoint } from "./utils";
import { Pricing } from "../../entity/Miles/Pricing";

export type PricingProps = {
  sizeId: number,
  sizeName: string,
  priceKm: number,
  pricePause: number,
  priceUnlock: number,
  pricePreBooking?: number, // todo function to update this later if previously unset - not included in prices query  
};

export async function insertPricing(
  manager: EntityManager,
  redis: RedisClientType,
  props: PricingProps,
): Promise<number> {
  const id = await insertPostgres(manager, props);
  await insertRedis(redis, id, props);
  return id;
}

async function insertPostgres(
  manager: EntityManager,
  props: PricingProps,
): Promise<number> {
  const pricing = new Pricing();
  pricing.sizeId = props.sizeId;
  pricing.priceKm = props.priceKm;
  pricing.pricePause = props.pricePause;
  pricing.priceUnlock = props.priceUnlock;
  pricing.pricePreBooking = props.pricePreBooking;

  const saved = await manager.save(pricing);
  return saved.id;
}

async function insertRedis(
  redis: RedisClientType,
  id: number,
  props: PricingProps,
) {
  await redis.set(`miles:pricing:${props.sizeName}:${props.priceKm}km_${props.pricePause}min_${props.priceUnlock}x_${props.pricePreBooking}pre`, id); // todo delete booking undefined key and set new when setting it later
}
