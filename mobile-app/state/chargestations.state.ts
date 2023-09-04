import { create } from "zustand";
import { ChargeStation } from "../lib/Miles/types";
import { unionBy } from "lodash";
import { ChargeStationAvailability } from "../lib/ChargeStationAvailabilityType";

interface ChargeStationsState {
  stations:
    (ChargeStation & Partial<{ "availability": ChargeStationAvailability }>)[];
  updateStations: (stations: ChargeStation[]) => void;
  // updateStationsAvailabilities for when availabilities are updated seperately
  clearStations: () => void;
}

export const useChargeStations = create<ChargeStationsState>(
  (set) => ({
    stations: [],
    updateStations: (stations: ChargeStation[]) =>
      set((current) => ({
        stations: tempMergeStations(current.stations, stations),
      })),
    clearStations: () => set({ stations: [] }),
  }),
);

const tempMergeStations = (
  currentStations: ChargeStation[],
  newStations: ChargeStation[],
): ChargeStation[] => {
  // todo properly merge chargestations
  return unionBy(
    currentStations,
    newStations,
    (v) => v.milesId,
  );
};