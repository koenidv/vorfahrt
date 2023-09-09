import MilesDatabase from "../MilesDatabase";
import { VehicleCurrent } from "../../entity/Miles/VehicleCurrent";
import { createPoint } from "../insert/parsePoint";
import { MilesVehicleStatus } from "@koenidv/abfahrt";

export type VehicleProps = {
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
  pricePreBooking: number;
  charging: boolean;
  coverageGsm: number;
  coverageSatellites: number;
};

export async function insertVehicleAndRelations(
  db: MilesDatabase,
  props: VehicleProps,
): Promise<number> {
  const sizeId = await db.size({ name: props.sizeName });
  const modelId = await db.model({
    name: props.modelName,
    seats: props.seats,
    electric: props.electric,
    enginePower: props.enginePower,
    transmission: props.transmission,
    fuelType: props.fuelType,
    sizeId: sizeId,
  });

  const cityId = await db.getCity(props.cityName);
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
  current.pricePreBooking = props.pricePreBooking;
  current.pricingId = -1; // todo pricings
  current.status = props.status;

  const metaId = await db.vehicleMeta({
    milesId: props.milesId,
    licensePlate: props.licensePlate,
    color: props.color,
    imageUrl: props.imageUrl,
    modelId: modelId,
    firstCityId: cityId,
    current: current,
  });

  return metaId;
}
