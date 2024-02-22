import { ChargeStationAvailability } from "./ChargeStationAvailabilityType";
import { ChargeStation } from "./Miles/types";

export enum CHARGE_LOCATION_TOLERANCE {
  BSW = 0,
  WECHARGE = 0.001,
}

export const mergeChargeStationAvailability = (
  chargeStations: ChargeStation[],
  chargeStationAvailabilities: ChargeStationAvailability[],
  tolerance: number = 0,
): (
  & ChargeStation
  & Partial<{ "availability": ChargeStationAvailability }>
)[] => {
  return chargeStations.map((station) => {
    const availability = chargeStationAvailabilities.find((availability) => {
      const latDiff = Math.abs(
        availability.coordinates.lat - station.coordinates.lat,
      );
      const lngDiff = Math.abs(
        availability.coordinates.lng - station.coordinates.lng,
      );
      const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
      return distance <= tolerance;
    });

    // do not override previous availability without new information
    if (availability === undefined) return station;
    return {
      ...station,
      availability: availability,
    };
  });
};
