import MilesDatabase from "../MilesDatabase";
import { VehicleCurrent } from "../../entity/Miles/VehicleCurrent";
import { MilesVehicleStatus } from "@koenidv/abfahrt";
import { apiVehicleJsonParsed } from "@koenidv/abfahrt/dist/src/miles/apiTypes";
import { ChangeEvent } from "../../entity/Miles/_ChangeEventEnum";
import Point from "../utils/Point";

export type CreateVehicleProps = {
  apiVehicle: apiVehicleJsonParsed; // todo WIP

  milesId: number;
  modelName: string;
  licensePlate: string;
  sizeName: string;
  cityName: string;

  seats: number;
  electric: boolean;
  enginePower: number;
  transmission: string;
  fuelType: string;
  color: string;
  imageUrl: string;
  isCharity: boolean;

  status: typeof MilesVehicleStatus;
  lat: number;
  lng: number;
  fuelPercent: number;
  range: number;
  charging: boolean;
  coverageGsm: number;
  coverageSatellites: number;

  discounted: boolean;
  discountSource: string | null;
  priceKm: number;
  pricePause: number;
  priceUnlock: number;
  pricePreBooking: number;
  damages: { title: string, damages: string[] }[]; // todo import damages type from abfahrt
};

export async function createVehicleFromApiType(db: MilesDatabase, apiVehicle: apiVehicleJsonParsed) {
  const vehicleDetails = apiVehicle.JSONFullVehicleDetails.vehicleDetails;
  const pricing = apiVehicle.JSONFullVehicleDetails.standardPricing[0]
  return await insertVehicleAndRelations(db, {
    milesId: apiVehicle.idVehicle,
    modelName: apiVehicle.VehicleType,
    licensePlate: apiVehicle.LicensePlate,
    sizeName: apiVehicle.VehicleSize,
    cityName: apiVehicle.idCity,
    seats: Number(vehicleDetails.find(d => d.key === "vehicle_details_seats").value),
    electric: apiVehicle.isElectric,
    enginePower: apiVehicle.EnginePower,
    transmission: vehicleDetails.find(d => d.key === "vehicle_details_transmission").value,
    fuelType: vehicleDetails.find(d => d.key === "vehicle_details_fuel").value,
    color: apiVehicle.VehicleColor,
    imageUrl: apiVehicle.URLVehicleImage,
    isCharity: apiVehicle.isCharity,
    status: apiVehicle.idVehicleStatus as unknown as typeof MilesVehicleStatus,
    lat: apiVehicle.Latitude,
    lng: apiVehicle.Longitude,
    fuelPercent: apiVehicle.FuelPct_parsed,
    range: apiVehicle.RemainingRange_parsed,
    charging: apiVehicle.EVPlugged,
    coverageGsm: apiVehicle.GSMCoverage,
    coverageSatellites: apiVehicle.SatelliteNumber,
    discounted: apiVehicle.RentalPrice_discountSource != null,
    discountSource: apiVehicle.RentalPrice_discountSource,
    priceKm: apiVehicle.RentalPrice_discounted_parsed || apiVehicle.RentalPrice_row1_parsed,
    pricePause: apiVehicle.ParkingPrice_discounted_parsed || apiVehicle.ParkingPrice_parsed,
    priceUnlock: apiVehicle.UnlockFee_discounted_parsed || apiVehicle.UnlockFee_parsed,
    pricePreBooking: pricing.preBookingFeePerMinute,y
    damages: apiVehicle.JSONVehicleDamages,
  });


}

async function insertVehicleAndRelations(
  db: MilesDatabase,
  props: CreateVehicleProps,
): Promise<number> {
  // get city id
  // vehicles only contain milesCityIds, but locations and polygons are required to create a new city
  const cityId = await db.getCityId(props.cityName);
  if (!cityId) {
    throw new Error(
      `City ${props.cityName} not found. Cities cannot be created from vehicles. Vehicle ${props.milesId}`,
    );
  }

  // get size id or create if new
  const sizeId = await db.sizeId({ name: props.sizeName });
  
  // get model id or create if new
  const modelId = await db.modelId({
    name: props.modelName,
    seats: props.seats,
    electric: props.electric,
    enginePower: props.enginePower,
    transmission: props.transmission,
    fuelType: props.fuelType,
    sizeId: sizeId,
  });

  // get pricing id or create if new
  const pricingId = await db.pricingId({
    sizeId: sizeId,
    sizeName: props.sizeName,
    discounted: props.discounted,
    discountSource: props.discountSource,
    priceKm: props.priceKm,
    pricePause: props.pricePause,
    priceUnlock: props.priceUnlock,
    pricePreBooking: props.pricePreBooking,
  });

  // current vehicle state - cascaded insert with vehicle meta
  const current = new VehicleCurrent();
  current.location = new Point(props.lat, props.lng).toString();
  current.cityId = cityId;
  current.charging = props.charging;
  current.coverageGsm = props.coverageGsm;
  current.coverageSatellites = props.coverageSatellites;
  current.fuelPercent = props.fuelPercent;
  current.range = props.range;
  current.pricingId = pricingId;
  current.status = props.status;

  // insert vehicle meta
  const metaId = await db.vehicleMetaId({
    apiVehicle: props.apiVehicle,
    modelId: modelId,
    firstCityId: cityId,
    current: current,
  });

  // insert each damage
  for (const damage of props.damages) {
    await db.insertVehicleDamage({
      vehicleMetaId: metaId,
      milesId: props.milesId,
      title: damage.title,
      damages: damage.damages,
    });
  }

  // insert vehicled added change with all values
  const createdChangeId = await db.insertVehicleChange({
    event: ChangeEvent.add,
    metaId: metaId,
    status: props.status,
    lat: props.lat,
    lng: props.lng,
    charging: props.charging,
    fuelPercent: props.fuelPercent,
    range: props.range,
    coverageGsm: props.coverageGsm,
    coverageSatellites: props.coverageSatellites,
    cityId: cityId,
    pricingId: pricingId,
  });


  return metaId;
}
