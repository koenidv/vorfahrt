import { Region } from "react-native-maps";
import { useUpdateChargeStations } from "../state/chargestations.state";
import { fetchChargeStationsForRegion } from "./Miles/fetchForRegion";
import { VehicleFetchOptions } from "./Miles/fetchVehicles";
import { parseChargeStations } from "./Miles/parseVehiclesResponse";

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
