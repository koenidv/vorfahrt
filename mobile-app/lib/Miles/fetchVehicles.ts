import { BASE_URL } from "./config";
import type { apiVehiclesResponse } from "./apiTypes";
import { VehicleEngine, VehicleSeats, VehicleSize } from "./enums";

export type VehicleFetchOptions = {
  deviceKey: string;
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
  userLatitude: number;
  userLongitude: number;
  zoomLevel: number;
  lang?: string; // default "en"
  minFuel?: number; // FuelLevelFilterMin, default undefined
  maxFuel?: number; // FuelLevelFilterMax, default undefined
  size?: VehicleSize[]; // VehicleSizeFilter, default undefined
  engine?: VehicleEngine[]; // vehicleEngineFilter, default undefined
  seats?: VehicleSeats[]; // VehicleSeatsFilter, default undefined
  model?: string[]; // vehicleModelsFilter, default undefined
  onlyDiscounted?: boolean; // showOnlyDiscountedVehicles, default false
  showFuelingStations?: boolean; // showFuelingStations, default false
  showChargingStations?: boolean; // showChargingStations, default false
  showPartners?: boolean; // showPartners, default false
};

export const fetchVehicles = async (
  options: VehicleFetchOptions,
): Promise<apiVehiclesResponse> => {
  const startTime = performance.now();
  const res = await fetch(
    `${BASE_URL}/Vehicles?` + new URLSearchParams({
      deviceKey: options.deviceKey,
      latitude: options.latitude.toString(),
      longitude: options.longitude.toString(),
      latitudeDelta: options.latitudeDelta.toString(),
      longitudeDelta: options.longitudeDelta.toString(),
      userLatitude: options.userLatitude.toString(),
      userLongitude: options.userLongitude.toString(),
      zoomLevel: options.zoomLevel.toString(),
      lang: options.lang ?? "en",
      FuelLevelFilterMin: options.minFuel?.toString() || "0",
      FuelLevelFilterMax: options.maxFuel?.toString() || "100",
      VehicleSizeFilter: options.size?.join(",") || "",
      vehicleEngineFilter: options.engine?.join(",") || "",
      VehicleSeatsFilter: options.seats?.join(",") || "",
      vehicleModelsFilter: options.model?.join(",") || "",
      showOnlyDiscountedVehicles: options.onlyDiscounted === true ? "1" : "0",
      showFuelingStations: options.showFuelingStations === true ? "1" : "0",
      showChargingStations: options.showChargingStations === true ? "1" : "0",
      showMilesPartners: options.showPartners === true ? "1" : "0",
      VehicleTransmissionFilter: "",
    }),
  );
  console.log("fetchVehicles", performance.now() - startTime);

  if (!res.ok) {
    throw new Error(`fetchVehicles failed with status ${res.status}`);
  }

  const json = await res.json() as apiVehiclesResponse;
  return json;
};
