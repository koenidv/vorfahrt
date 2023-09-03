import { ChargeStationAvailability } from "./ChargeStationAvailabilityType";
import { ChargeStation } from "./Miles/types";

export const mergeChargeStationAvailability = (
  chargeStations: ChargeStation[],
  chargeStationAvailabilities: ChargeStationAvailability[],
): (
  & ChargeStation
  & Partial<{ "availability": ChargeStationAvailability }>
)[] => {
  return chargeStations.map((station) => {
    const availability = chargeStationAvailabilities.find((availability) => (
        availability.coordinates.lat === station.coordinates.lat &&
        availability.coordinates.lng === station.coordinates.lng
    ));
    // do not override previous availability without new information
    if (!availability) return station;
    return {
      ...station,
      availability: availability,
    };
  });
};
