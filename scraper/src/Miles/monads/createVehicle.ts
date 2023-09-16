import MilesDatabase from "../MilesDatabase";
import { VehicleCurrent } from "../../entity/Miles/VehicleCurrent";
import { createPoint } from "../insert/utils";
import { MilesVehicleStatus } from "@koenidv/abfahrt";
import { apiVehicleJsonParsed } from "@koenidv/abfahrt/dist/src/miles/apiTypes";

export type CreateVehicleProps = {
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

  status: typeof MilesVehicleStatus;
  lat: number;
  lng: number;
  fuelPercent: number;
  range: number;
  charging: boolean;
  coverageGsm: number;
  coverageSatellites: number;
};

export async function createVehicleFromApiType(db: MilesDatabase, apiVehicle: apiVehicleJsonParsed) {
  const vehicleDetails = apiVehicle.JSONFullVehicleDetails.vehicleDetails;
  return await insertVehicleAndRelations(db, {
    milesId: Number(apiVehicle),
    modelName: apiVehicle.VehicleType,
    licensePlate: apiVehicle.LicensePlate,
    sizeName: apiVehicle.VehicleSize,
    cityName: apiVehicle.idCity,
    seats: Number(apiVehicle.JSONFullVehicleDetails.),
    electric: apiVehicle.isElectric,
    enginePower: apiVehicle.EnginePower,
    transmission: vehicleDetails.find(d => d.key === "vehicle_details_transmission").value,
    fuelType: vehicleDetails.find(d => d.key === "vehicle_details_fuel").value,
    color: apiVehicle.VehicleColor,
    imageUrl: apiVehicle.URLVehicleImage,
    status: apiVehicle.idVehicleStatus as MilesVehicleStatus,
    lat: apiVehicle.Latitude,
    lng: apiVehicle.Longitude,
    fuelPercent: Number(apiVehicle.FuelPct),
    range: Number(apiVehicle.RemainingRange),
    charging: apiVehicle.EVPlugged,
    coverageGsm: apiVehicle.GSMCoverage,
    coverageSatellites: apiVehicle.SatelliteNumber,
  });
}

async function insertVehicleAndRelations(
  db: MilesDatabase,
  props: CreateVehicleProps,
): Promise<number> {
  const sizeId = await db.sizeId({ name: props.sizeName });
  const modelId = await db.modelId({
    name: props.modelName,
    seats: props.seats,
    electric: props.electric,
    enginePower: props.enginePower,
    transmission: props.transmission,
    fuelType: props.fuelType,
    sizeId: sizeId,
  });

  const cityId = await db.getCityId(props.cityName);
  if (!cityId) {
    throw new Error(
      `City ${props.cityName} not found. Cities cannot be created from vehicles. Vehicle ${props.milesId}`,
    );
  }

  const current = new VehicleCurrent();
  current.location = createPoint({ lat: props.lat, lng: props.lng });
  current.cityId = cityId;
  current.charging = props.charging;
  current.coverageGsm = props.coverageGsm;
  current.coverageSatellites = props.coverageSatellites;
  current.fuelPercent = props.fuelPercent;
  current.range = props.range;
  current.pricingId = -1; // todo pricings
  current.status = props.status;

  const metaId = await db.vehicleMetaId({
    milesId: props.milesId,
    licensePlate: props.licensePlate,
    color: props.color,
    imageUrl: props.imageUrl,
    modelId: modelId,
    firstCityId: cityId,
    current: current,
  });

  // todo damages

  return metaId;
}
