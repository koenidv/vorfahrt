import { EntityManager, Point } from "typeorm";
import { RedisClientType } from "@redis/client";
import { City } from "../../entity/Miles/City";
import { createPoint } from "./utils";
import { Pricing } from "../../entity/Miles/Pricing";
import { PricingHistory } from "../../entity/Miles/PricingHistory";

export type PricingProps = {
  currentId: Pricing,
  priceKm: number,
  pricePause: number,
  priceUnlock: number,
  pricePreBooking?: number, // todo function to update this later if previously unset - not included in prices query
  };

export async function insertPricingHistory(
  manager: EntityManager,
  redis: RedisClientType,
  props: PricingProps,
): Promise<number> {
  const id = await insertPostgres(manager, props);
  return id;
}

async function insertPostgres(
  manager: EntityManager,
  props: PricingProps,
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
