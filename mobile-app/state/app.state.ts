import { create } from "zustand";
import { type Vehicle } from "../lib/Miles/types";
import { mergeVehiclesForRegion } from "../lib/mergeVehiclesForRegion";
import { Region } from "react-native-maps";

interface VehiclesState {
    fetching: boolean; // fixme this should be the # of running tasks / otherwise bug if one task finishes before another
    setFetching: (fetching: boolean) => void;
    selectedVehicle: Vehicle | undefined;
    setSelectedVehicle: (id: Vehicle | undefined) => void;
}

export const useAppState = create<VehiclesState>(
  (set) => ({
    fetching: false,
    setFetching: (fetching) => set({ fetching }),
    selectedVehicle: undefined,
    setSelectedVehicle: (selectedVehicle: Vehicle | undefined) => set({ selectedVehicle }),
  }),
);