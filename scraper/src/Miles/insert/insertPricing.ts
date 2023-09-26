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
  pricePreBooking: number,
};

export async function insertPricing(
  manager: EntityManager,
  props: PricingProps,
): Promise<Pricing> {
  const pricing = new Pricing();
  pricing.priceKm = props.priceKm;
  pricing.discounted = props.discounted;
  pricing.discountReason = props.discountSource;
  pricing.pricePause = props.pricePause;
  pricing.priceUnlock = props.priceUnlock;
  pricing.pricePreBooking = props.pricePreBooking;

  const saved = await manager.save(pricing);
  return saved;
  // fixme relation is not set properly - https://orkhan.gitbook.io/typeorm/docs/relational-query-builder
}