import { Region } from "react-native-maps";
import { AUTH_TOKEN, BASE_URL } from "./config";
import { parseRegion } from "./parseRegion";
import { WeChargeStation } from "./types";
import { ChargeStationAvailability } from "../ChargeStationAvailabilityType";

export const weChargeAvailability = async (region: Region) => {
  return parseWeChargeStations(await weChargeStationsForRegion(region));
};

const weChargeStationsForRegion = async (region: Region) => {
  const res = await fetch(
    `${BASE_URL}/searchAndFind`,
    {
      headers: {
        "X-Auth-Token": AUTH_TOKEN,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        boundingBox: parseRegion(region),
        zoomLevel: 20,
        connectorTypes: [],
        authentication: [],
        isIonityOnly: false,
        filterByBrand: null,
        isFreeCharging: false,
        isAvailable: false,
        minChargingSpeed: 0,
      }),
    },
  );
  if (!res.ok) {
    console.log(JSON.stringify({
      boundingBox: parseRegion(region),
      zoomLevel: 20,
      connectorTypes: [],
      authentication: [],
      isIonityOnly: false,
      filterByBrand: null,
      isFreeCharging: false,
      isAvailable: false,
      minChargingSpeed: 0,
    }));
    console.error(res.status, res.statusText, await res.text());
    throw new Error(
      `weChargeStationsForRegion: ${res.status} ${res.statusText}`,
    );
  }

  const json = await res.json();
  return json.result;
};

const parseWeChargeStations = (
  data: WeChargeStation[],
): ChargeStationAvailability[] => {
  return data.map((station) => ({
    provider: "WeCharge",
    name: station.name,

    coordinates: {
      lat: station.position.lat,
      lng: station.position.lng,
    },

    statusKnown: station.station.liveCountAvailableChargingPoints !== undefined,
    available: station.station.liveCountAvailableChargingPoints ?? 0,
    total: station.station.totalCountChargingPoints,
  }));
};
