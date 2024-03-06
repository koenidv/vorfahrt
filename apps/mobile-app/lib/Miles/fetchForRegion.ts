import { fetchVehicles } from "./fetchVehicles";
import { Region } from "react-native-maps";
import { apiVehiclesResponse } from "./apiTypes";
import { VehicleFetchOptions } from "./fetchVehicles";
import { VehicleEngine, VehicleSize } from "./enums";
import { DeviceKey } from "./DeviceKey";

export const fetchVehiclesForRegion = async (
  region: Region,
  options?: Partial<VehicleFetchOptions>,
): Promise<apiVehiclesResponse> => {
  return await fetchVehicles({
    deviceKey: await DeviceKey.getCurrent(),
    longitude: region.longitude,
    latitude: region.latitude,
    longitudeDelta: region.longitudeDelta,
    latitudeDelta: region.latitudeDelta,
    userLongitude: region.longitude,
    userLatitude: region.latitude,
    zoomLevel: 20,
    size: [VehicleSize.small, VehicleSize.medium],
    maxFuel: 32,
    engine: [VehicleEngine.electric],
    showChargingStations: false,
    ...options,
  });
  // todo refetch clusters
};

export const fetchChargeStationsForRegion = async (
  region: Region,
  options?: Partial<VehicleFetchOptions>,
): Promise<apiVehiclesResponse> => {
  return await fetchVehiclesForRegion(region, {
    showChargingStations: true,
    minFuel: 0,
    maxFuel: 0,
    size: [],
    ...options,
  });
  // todo multiple queries if region is too big (no pois near the border)
};
