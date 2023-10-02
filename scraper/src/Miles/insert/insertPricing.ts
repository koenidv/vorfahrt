import { EntityManager, Point } from "typeorm";
import { Pricing } from "../../entity/Miles/Pricing";
import { apiVehicleJsonParsed } from "@koenidv/abfahrt/dist/src/miles/apiTypes";

export async function insertPricing(
  manager: EntityManager,
  vehicle: apiVehicleJsonParsed,
): Promise<Pricing> {
  const vehiclepricing = vehicle.JSONFullVehicleDetails.standardPricing[0];
  if (!vehiclepricing) throw new Error(`Pricing not found for vehicle ${vehicle.idVehicle}`);
  const pricing = new Pricing();

  pricing.discounted = vehicle.RentalPrice_discountSource != null;
  pricing.discountReason = vehicle.RentalPrice_discountSource;
  pricing.priceKm = vehicle.RentalPrice_discounted_parsed ?? vehicle.RentalPrice_row1_parsed;
  pricing.pricePause = vehicle.ParkingPrice_discounted_parsed ?? vehicle.ParkingPrice_parsed;
  pricing.priceUnlock = vehicle.UnlockFee_discounted_parsed ?? vehicle.UnlockFee_parsed;
  pricing.pricePreBooking = vehiclepricing.preBookingFeePerMinute_discounted as number ?? vehiclepricing.preBookingFeePerMinute;

  const saved = await manager.save(pricing);
  return saved;
}