import { create } from "zustand";
import { type Vehicle } from "../lib/Miles/types";
import { mergeVehiclesForRegion } from "../lib/mergeVehiclesForRegion";
import { Region } from "react-native-maps";

interface VehiclesState {
    fetching: boolean;
    setFetching: (fetching: boolean) => void;
    selectedVehicleId: number | undefined;
    setSelectedVehicleId: (id: number | undefined) => void;
}

export const useAppState = create<VehiclesState>(
  (set) => ({
    fetching: false,
    setFetching: (fetching) => set({ fetching }),
    selectedVehicleId: undefined,
    setSelectedVehicleId: (id) => set({ selectedVehicleId: id }),
  }),
);