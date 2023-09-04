import { Region } from "react-native-maps";
import { fetchChargeStationsForRegion } from "./Miles/fetchForRegion";
import { VehicleFetchOptions } from "./Miles/fetchVehicles";
import { parseChargeStations } from "./Miles/parseVehiclesResponse";
import { weChargeAvailability } from "./WeCharge/chargeStations";
import { bswChargeAvailability } from "./BerlinerStadtwerke/chargeStations";
import {
  CHARGE_LOCATION_TOLERANCE,
  mergeChargeStationAvailability,
} from "./mergeChargeStationAvailability";
import { useChargeStations } from "../state/chargestations.state";

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
  console.log("fetchChargeStationsForRegionUpdateState")
  const [stationsRaw, bsrAvailabilities, weAvailabilities] = await Promise.all([
    fetchChargeStationsForRegion(region, options),
    bswChargeAvailability(region),
    weChargeAvailability(region),
  ]);
  console.log("fetched stations")

  const stations = parseChargeStations(stationsRaw);
  // do not use BSR availibilities from WeCharge, BSR is more accurate
  const availabilities = [
    ...bsrAvailabilities,
    ...weAvailabilities.filter((a) => !a.name.includes("Berliner Stadtwerke")),
  ];
  console.log("parsed stations")

  const merged = mergeChargeStationAvailability(
    stations,
    availabilities,
    CHARGE_LOCATION_TOLERANCE.WECHARGE,
  );
  console.log("merged stations")

  useChargeStations.getState().updateStations(merged);
  console.log("updated stations")
};
