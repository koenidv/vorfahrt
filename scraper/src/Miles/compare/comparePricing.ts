import { apiVehicleJsonParsed } from "@koenidv/abfahrt/dist/src/miles/apiTypes";
import { Pricing } from "../../entity/Miles/Pricing";

/**
 * Compares api and db pricings. This does not account for vehicle size differences.
 * @param apiVehicle Vehicle as returned by the Miles API, including pricing
 * @param dbPricing Pricing entity from the database
 * @returns true if both pricings match. This does not account for vehicle size differences.
 */
export function compareDbAndApiPricing(
    apiVehicle: apiVehicleJsonParsed,
    dbPricing: Pricing,
) {
    return (
        (apiVehicle.RentalPrice_discountSource != null) === dbPricing.discounted &&
        apiVehicle.RentalPrice_discountSource === dbPricing.discountReason &&
        apiVehicle.RentalPrice_discounted_parsed === dbPricing.priceKm &&
        apiVehicle.ParkingPrice_discounted_parsed === dbPricing.pricePause &&
        apiVehicle.UnlockFee_discounted_parsed === dbPricing.priceUnlock &&
        apiVehicle.JSONFullVehicleDetails.standardPricing[0].preBookingFeePerMinute === dbPricing.pricePreBooking
    )
}