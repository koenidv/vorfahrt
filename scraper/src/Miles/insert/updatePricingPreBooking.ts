import { EntityManager, Point } from "typeorm";
import { RedisClientType } from "@redis/client";
import { City } from "../../entity/Miles/City";
import { createPoint } from "./utils";
import { Pricing } from "../../entity/Miles/Pricing";

export type PricingProps = {
  pricingId: number,
  sizeName: string, // needed to delete old redis key
  priceKm: number, // needed to delete old redis key
  pricePause: number, // needed to delete old redis key
  priceUnlock: number, // needed to delete old redis key
  pricePreBooking: number,
};

export async function updatePricingPreBooking(
  manager: EntityManager,
  redis: RedisClientType,
  props: PricingProps,
): Promise<number> {
  const id = await updatePostgres(manager, props);
  await updateRedis(redis, id, props);
  return id;
}

async function updatePostgres(
  manager: EntityManager,
  props: PricingProps,
): Promise<number> {
  const pricing = await manager.findOneBy(Pricing, {
    id: props.pricingId
  });
  if (!pricing) {
    throw new Error(`Cannot update pricing ${props.pricingId} - not found`);
  }

  pricing.pricePreBooking = props.pricePreBooking;

  const saved = await manager.save(pricing);
  return saved.id;
}

async function updateRedis(
  redis: RedisClientType,
  id: number,
  props: PricingProps,
) {
  await redis.del(`miles:pricing:${props.sizeName}:${props.priceKm}km_${props.pricePause}min_${props.priceUnlock}x_undefinedpre`);
  await redis.set(`miles:pricing:${props.sizeName}:${props.priceKm}km_${props.pricePause}min_${props.priceUnlock}x_${props.pricePreBooking}pre`, id);
}
