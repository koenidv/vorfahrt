import { fetchChargeStationsForRegion, fetchVehiclesForRegion } from "./Miles/fetchForRegion";
import { VehicleFetchOptions } from "./Miles/fetchVehicles";
import { parseChargeStations, parseVehicles } from "./Miles/parseVehiclesResponse";
import { weChargeAvailability } from "./WeCharge/chargeStations";
import { bswChargeAvailability } from "./BerlinerStadtwerke/chargeStations";
import {
  CHARGE_LOCATION_TOLERANCE,
  mergeChargeStationAvailability,
} from "./mergeChargeStationAvailability";
import { useChargeStations } from "../state/chargestations.state";
import { useRegion } from "../state/region.state";
import { Region } from "react-native-maps";
import { useVehicles } from "../state/vehicles.state";
import { useClusters } from "../state/clusters.state";
import { useFilters } from "../state/filters.state";
import { chargeFilter } from "./Miles/chargeFilter";
import { Vehicle } from "./Miles/types";
import { apiCluster } from "./Miles/apiTypes";
import { DeviceKey } from "./Miles/DeviceKey";
import { useAppState } from "../state/app.state";

export const fetchVehiclesForRegionUpdateState = async (
  region: Region
) => {
  const filters = useFilters.getState();
  const parsedVehicles: Vehicle[] = [];
  const clusters: apiCluster[] = [];
  const appState = useAppState.getState();
  appState.setFetching(true);

  // make sure we have a devicekey to avoid creating multiple at once
  await DeviceKey.getCurrent();

  await Promise.all(filters.engineType.map(async (engineType) => {
    const options: Partial<VehicleFetchOptions> = {
      engine: [engineType],
      maxFuel: chargeFilter(engineType, filters.chargeOverflow)
    }
    const response = await fetchVehiclesForRegion(region, options);
    // todo should automatically refetch clusters
    parsedVehicles.push(...parseVehicles(response));
    clusters.push(...response.Data.clusters);
  }));
  
  useVehicles.getState().updateVehicles(parsedVehicles, region);
  useClusters.getState().setClusters(clusters);

  appState.setFetching(false);
};

export const fetchChargeStationsCurrentRegionUpdateState = async (
  options?: Partial<VehicleFetchOptions>,
) => {
  const appState = useAppState.getState();
  appState.setFetching(true);

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
  
  appState.setFetching(false);
};
