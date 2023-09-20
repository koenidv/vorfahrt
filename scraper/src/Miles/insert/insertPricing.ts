import { EntityManager, Point } from "typeorm";
import { RedisClientType } from "@redis/client";
import { Pricing } from "../../entity/Miles/Pricing";

export type PricingProps = {
  sizeId: number,
  sizeName: string,
  discounted: boolean,
  discountSource: string | null,
  priceKm: number,
  pricePause: number,
  priceUnlock: number,
  pricePreBooking?: number,
};

export async function insertPricing(
  manager: EntityManager,
  redis: RedisClientType,
  props: PricingProps,
): Promise<number> {
  const id = await insertPostgres(manager, props);
  await insertRedis(redis, id, props);
  return id;
  // fixme relation is not set properly - https://orkhan.gitbook.io/typeorm/docs/relational-query-builder
}

async function insertPostgres(
  manager: EntityManager,
  props: PricingProps,
): Promise<number> {
  const pricing = new Pricing();
  pricing.sizeId = props.sizeId;
  pricing.priceKm = props.priceKm;
  pricing.discounted = props.discounted;
  pricing.discountReason = props.discountSource;
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
  await redis.set(`miles:pricing:${props.sizeName}:${props.priceKm}km_${props.pricePause}min_${props.priceUnlock}x_${props.pricePreBooking}pre`, id);
}
