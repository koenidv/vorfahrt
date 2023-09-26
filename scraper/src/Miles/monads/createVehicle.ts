import MilesDatabase from "../MilesDatabase";
import { VehicleCurrent } from "../../entity/Miles/VehicleCurrent";
import { MilesVehicleStatus } from "@koenidv/abfahrt";
import { apiVehicleJsonParsed } from "@koenidv/abfahrt/dist/src/miles/apiTypes";
import { ChangeEvent } from "../../entity/Miles/_ChangeEventEnum";
import Point from "../utils/Point";
import { VehicleMeta } from "../../entity/Miles/VehicleMeta";

/**
 * Create a vehicle with meta, current, add event. Also inserts size and pricing if new.
 * @param db MilesDatabase instance
 * @param vehicle Single vehicle as returned by the Miles API
 * @returns id of the inserted vehicle meta
 * @throws Error if city is not found
 * @throws Error if details or pricing are not found within the apiVehicle
 */
export async function insertVehicleAndRelations(
  db: MilesDatabase,
  vehicle: apiVehicleJsonParsed,
): Promise<VehicleMeta> {
  
    const vehicleDetails = vehicle.JSONFullVehicleDetails.vehicleDetails;

    if (!vehicleDetails) throw new Error(`Vehicle details not found for vehicle ${vehicle.idVehicle}`);
  
    // get city id
  // vehicles only contain milesCityIds, but locations and polygons are required to create a new city
  const city = await db.getCity(vehicle.idCity);
  if (!city) {
    throw new Error(
      `City ${vehicle.idCity} not found. Cities cannot be created from vehicles. Vehicle ${vehicle.idVehicle}`,
    );
  }

  // get size id or create if new
  const sizeId = await db.sizeId({ name: vehicle.VehicleSize });
  
  // get model id or create if new
  const modelId = await db.modelId({
    name: vehicle.VehicleType,
    seats: Number(vehicleDetails.find(d => d.key === "vehicle_details_seats").value),
    electric: vehicle.isElectric,
    enginePower: vehicle.EnginePower,
    transmission: vehicleDetails.find(d => d.key === "vehicle_details_transmission").value,
    fuelType: vehicleDetails.find(d => d.key === "vehicle_details_fuel").value,
    sizeId: sizeId,
  });

  // get pricing id or create if new
  const pricing = await db.getOrInsertPricing(vehicle);

  // current vehicle state - cascaded insert with vehicle meta
  const current = new VehicleCurrent();
  current.location = new Point(vehicle.Latitude, vehicle.Longitude).toString();
  current.cityId = city.id;
  current.charging = vehicle.EVPlugged;
  current.coverageGsm = vehicle.GSMCoverage;
  current.coverageSatellites = vehicle.SatelliteNumber;
  current.fuelPercent = vehicle.FuelPct_parsed;
  current.range = vehicle.RemainingRange_parsed;
  current.pricing = pricing;
  current.status = vehicle.idVehicleStatus as unknown as keyof typeof MilesVehicleStatus;

  // insert vehicle meta
  const meta = await db.insertVehicleMeta({
    apiVehicle: vehicle,
    modelId: modelId,
    firstCityId: city.id,
    current: current,
  });

  // insert each damage
  for (const damage of vehicle.JSONVehicleDamages) {
    await db.insertVehicleDamage({
      vehicleMetaId: meta.id,
      milesId: vehicle.idVehicle,
      title: damage.title,
      damages: damage.damages,
    });
  }

  // insert vehicled added change with all values
  const createdChangeId = await db.insertVehicleChange({
    event: ChangeEvent.add,
    metaId: meta.id,
    status: vehicle.idVehicleStatus as unknown as keyof typeof MilesVehicleStatus,
    lat: vehicle.Latitude,
    lng: vehicle.Longitude,
    charging: vehicle.EVPlugged,
    fuelPercent: vehicle.FuelPct_parsed,
    range: vehicle.RemainingRange_parsed,
    coverageGsm: vehicle.GSMCoverage,
    coverageSatellites: vehicle.SatelliteNumber,
    cityId: city.id,
    pricingId: pricing.id,
  });


  return meta;
}
