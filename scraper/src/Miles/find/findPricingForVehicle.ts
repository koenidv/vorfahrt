import { apiVehicleJsonParsed } from "@koenidv/abfahrt/dist/src/miles/apiTypes";
import { Pricing } from "../../entity/Miles/Pricing";
import { EntityManager } from "typeorm";

export async function findPricingForVehicle(em: EntityManager, vehicle: apiVehicleJsonParsed): Promise<Pricing|null> {
    const vehiclepricing = vehicle.JSONFullVehicleDetails.standardPricing[0];
    if (!vehiclepricing) throw new Error(`Pricing not found for vehicle ${vehicle.idVehicle}`);

    return await em.findOneBy(Pricing, {
        discounted: vehicle.RentalPrice_discountSource != null,
        discountReason: vehicle.RentalPrice_discountSource,
        priceKm: vehicle.RentalPrice_discounted_parsed ?? vehicle.RentalPrice_row1_parsed,
        pricePause: vehicle.ParkingPrice_discounted_parsed ?? vehicle.ParkingPrice_parsed,
        priceUnlock: vehicle.UnlockFee_discounted_parsed ?? vehicle.UnlockFee_parsed,
        pricePreBooking: vehiclepricing.preBookingFeePerMinute_discounted as number ?? vehiclepricing.preBookingFeePerMinute,
    });
}