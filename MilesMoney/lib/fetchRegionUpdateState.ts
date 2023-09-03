import { Region } from "react-native-maps";
import { useUpdateChargeStations } from "../state/chargestations.state";
import { fetchChargeStationsForRegion } from "./Miles/fetchForRegion";
import { VehicleFetchOptions } from "./Miles/fetchVehicles";
import { parseChargeStations } from "./Miles/parseVehiclesResponse";
import {
  bswChargeStationsForRegion,
  parseBswChargeStations,
} from "./BerlinerStadtwerke/chargeStations";
import { mergeChargeStationAvailability } from "./mergeChargeStationAvailability";

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
  const parsed = parseChargeStations(response);
  useUpdateChargeStations(parsed);
  
  const bwsStations = await bswChargeStationsForRegion(region);
  mergeChargeStationAvailability(parsed, parseBswChargeStations(bwsStations));
};
