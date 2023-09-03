import { create } from "zustand";
import { ChargeStation, type Vehicle } from "../lib/Miles/types";
import { unionBy } from "lodash";
import { ChargeStationAvailability } from "../lib/ChargeStationAvailabilityType";

interface ChargeStationsState {
  stations:
    (ChargeStation & Partial<{ "availability": ChargeStationAvailability }>)[];
  setStations: (stations: ChargeStation[]) => void;
}

const chargeStationsState = create<ChargeStationsState>(
  (set) => ({
    stations: [],
    setStations: (stations) => set({ stations }),
  }),
);

export const useChargeStations = chargeStationsState.getState;
export const useUpdateChargeStations = (stations: ChargeStation[]) => {
  const joined = unionBy(
    chargeStationsState.getState().stations,
    stations,
    (v) => v.milesId,
  );
  chargeStationsState.getState().setStations(joined);
  // todo properly merge chargestations
};
