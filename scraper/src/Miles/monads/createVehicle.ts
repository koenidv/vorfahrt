import MilesDatabase from "../MilesDatabase";
import { VehicleCurrent } from "../../entity/Miles/VehicleCurrent";
import { createPoint } from "../insert/utils";
import { MilesVehicleStatus } from "@koenidv/abfahrt";
import { apiVehicleJsonParsed } from "@koenidv/abfahrt/dist/src/miles/apiTypes";
import { ChangeEvent } from "../../entity/Miles/_ChangeEventEnum";

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

  damages: { title: string, damages: string[] }[]; // todo import damages type from abfahrt
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
    status: apiVehicle.idVehicleStatus as unknown as typeof MilesVehicleStatus,
    lat: apiVehicle.Latitude,
    lng: apiVehicle.Longitude,
    fuelPercent: Number(apiVehicle.FuelPct),
    range: Number(apiVehicle.RemainingRange),
    charging: apiVehicle.EVPlugged,
    coverageGsm: apiVehicle.GSMCoverage,
    coverageSatellites: apiVehicle.SatelliteNumber,
    damages: apiVehicle.JSONVehicleDamages,
  });
}

async function insertVehicleAndRelations(
  db: MilesDatabase,
  props: CreateVehicleProps,
): Promise<number> {
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

  // get city id
  const cityId = await db.getCityId(props.cityName);
  if (!cityId) {
    throw new Error(
      `City ${props.cityName} not found. Cities cannot be created from vehicles. Vehicle ${props.milesId}`,
    );
  }

  // todo get or create pricing

  // current vehicle state - cascaded insert with vehicle meta
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

  // insert vehicle meta
  const metaId = await db.vehicleMetaId({
    milesId: props.milesId,
    licensePlate: props.licensePlate,
    color: props.color,
    imageUrl: props.imageUrl,
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
    pricingId: -1, // todo pricings
  });


  return metaId;
}
