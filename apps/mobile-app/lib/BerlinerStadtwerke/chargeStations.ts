import { Region } from "react-native-maps";
import { BASE_URL, CONTRACT_KEY } from "./config";
import { parseRegion } from "./parseRegion";
import { BswChargeStation } from "./types";
import { ChargeStationAvailability } from "../ChargeStationAvailabilityType";

export const bswChargeAvailability = async (region: Region) => {
  return parseBswChargeStations(await bswChargeStationsForRegion(region));
};

const bswChargeStationsForRegion = async (region: Region) => {
  const bswRegion = parseRegion(region);
  const startTime = performance.now();
  const res = await fetch(
    `${BASE_URL}/${CONTRACT_KEY}/getEmobilityLocationsData?` +
      new URLSearchParams({
        swlat: bswRegion.swlat.toString(),
        swlng: bswRegion.swlng.toString(),
        nelat: bswRegion.nelat.toString(),
        nelng: bswRegion.nelng.toString(),
      }),
    {
      headers: {
        "Accept": "application/vnd.powercloud.v2+json",
      },
    },
  );
  console.log("bswChargeStationsForRegion", performance.now() - startTime);
  if (!res.ok) {
    throw new Error(
      `bswChargeStationsForRegion: ${res.status} ${res.statusText}`,
    );
  }

  const json = await res.json();
  return json.data;
};

const parseBswChargeStations = (
  data: BswChargeStation[],
): ChargeStationAvailability[] => {
  return data.map((station) => ({
    provider: "BSW",
    name: "Berliner Stadtwerke",

    coordinates: {
      lat: parseFloat(station.coordinates.latitude),
      lng: parseFloat(station.coordinates.longitude),
    },

    statusKnown: station.evses.some((evse) =>
      !evse.connectors.some((connector) => connector.status === "UNKNOWN")
    ),

    available:
      station.evses.filter((evse) =>
        evse.connectors.some((connector) => connector.status === "AVAILABLE")
      ).length,

    total: station.evses.length,

    connectors: station.evses.map((evse) => ({
      id: evse.id,
      uid: evse.uid,
      available: evse.connectors.some((connector) =>
        connector.status === "AVAILABLE"
      ),
      statusKnown: !evse.connectors.some((connector) =>
        connector.status === "UNKNOWN"
      ),
    })),
  }));
};
