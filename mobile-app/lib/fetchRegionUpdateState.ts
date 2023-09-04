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
import { useRegion } from "../state/region.state";

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

export const fetchChargeStationsCurrentRegionUpdateState = async (
  options?: Partial<VehicleFetchOptions>,
) => {
  const region = useRegion.getState().current;
  const [stationsRaw, bsrAvailabilities, weAvailabilities] = await Promise.all([
    fetchChargeStationsForRegion(region, options),
    bswChargeAvailability(region),
    weChargeAvailability(region),
  ]);

  const stations = parseChargeStations(stationsRaw);
  // do not use BSR availibilities from WeCharge, BSR is more accurate
  const availabilities = [
    ...bsrAvailabilities,
    ...weAvailabilities.filter((a) => !a.name.includes("Berliner Stadtwerke")),
  ];

  const merged = mergeChargeStationAvailability(
    stations,
    availabilities,
    CHARGE_LOCATION_TOLERANCE.WECHARGE,
  );

  useChargeStations.getState().updateStations(merged);
};
