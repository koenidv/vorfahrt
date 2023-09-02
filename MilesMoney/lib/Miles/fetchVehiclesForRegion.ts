import { fetchVehicles } from "./fetchVehicles";
import { Region } from "react-native-maps";
import { apiVehiclesResponse } from "./apiTypes";
import { VehicleFetchOptions } from "./fetchVehicles";
import { DEVICE_KEY } from "./config";
import { VehicleEngine, VehicleSize } from "./enums";

export const fetchVehiclesForRegion = async (
  options: Partial<VehicleFetchOptions> & { "region": Region },
): Promise<apiVehiclesResponse> => {
  return await fetchVehicles({
    deviceKey: DEVICE_KEY,
    longitude: options.region.longitude,
    latitude: options.region.latitude,
    longitudeDelta: options.region.longitudeDelta,
    latitudeDelta: options.region.latitudeDelta,
    userLongitude: options.region.longitude,
    userLatitude: options.region.latitude,
    zoomLevel: 20,
    size: [VehicleSize.small, VehicleSize.medium],
    maxFuel: 30,
    engine: [VehicleEngine.electric],
    showChargingStations: false,
    ...options,
  });
  // todo refetch clusters
};
