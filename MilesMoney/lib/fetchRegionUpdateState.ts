import { Region } from "react-native-maps";
import { useUpdateChargeStations } from "../state/chargestations.state";
import { useUpdateVehicles } from "../state/vehicles.state";
import {
  fetchChargeStationsForRegion,
  fetchVehiclesForRegion,
} from "./Miles/fetchForRegion";
import { VehicleFetchOptions } from "./Miles/fetchVehicles";
import {
  parseChargeStations,
  parseVehicles,
} from "./Miles/parseVehiclesResponse";

// export const fetchVehiclesForRegionUpdateState = async (
//   region: Region,
//   options?: Partial<VehicleFetchOptions>,
// ) => {
//   const response = await fetchVehiclesForRegion(region, options);
//   useUpdateVehicles(parseVehicles(response));
//   if (options?.showChargingStations) {
//     useUpdateChargeStations(parseChargeStations(response));
//   }
// };

export const fetchChargeStationsForRegionUpdateState = async (
  region: Region,
  options?: Partial<VehicleFetchOptions>,
) => {
  const response = await fetchChargeStationsForRegion(region, options);
  useUpdateChargeStations(parseChargeStations(response));
};
