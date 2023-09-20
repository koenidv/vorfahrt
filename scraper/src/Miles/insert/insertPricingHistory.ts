import { EntityManager, Point } from "typeorm";
import { RedisClientType } from "@redis/client";
import { Pricing } from "../../entity/Miles/Pricing";
import { PricingHistory } from "../../entity/Miles/PricingHistory";

export type PricingHistoryProps = {
  currentId: Pricing,
  priceKm: number,
  pricePause: number,
  priceUnlock: number,
  pricePreBooking?: number,
  };

export async function insertPricingHistory(
  manager: EntityManager,
  redis: RedisClientType,
  props: PricingHistoryProps,
): Promise<number> {
  const id = await insertPostgres(manager, props);
  return id;
}

async function insertPostgres(
  manager: EntityManager,
  props: PricingHistoryProps,
): Promise<number> {
  const history = new PricingHistory();
  history.current = props.currentId;
  history.priceKm = props.priceKm;
  history.pricePause = props.pricePause;
  history.priceUnlock = props.priceUnlock;
  history.pricePreBooking = props.pricePreBooking;

  const saved = await manager.save(history);
  return saved.id;
}
