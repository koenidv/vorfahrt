import { Region } from "react-native-maps";
import {
  useChargeStations,
  useUpdateChargeStationAvailabilities,
  useUpdateChargeStations,
} from "../state/chargestations.state";
import { fetchChargeStationsForRegion } from "./Miles/fetchForRegion";
import { VehicleFetchOptions } from "./Miles/fetchVehicles";
import { parseChargeStations } from "./Miles/parseVehiclesResponse";
import { weChargeAvailability } from "./WeCharge/chargeStations";

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

  useUpdateChargeStationAvailabilities(await weChargeAvailability(region));
};
