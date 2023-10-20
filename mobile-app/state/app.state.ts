import { create } from "zustand";
import { ChargeStation, type Vehicle } from "../lib/Miles/types";
import { ChargeStationAvailability } from "../lib/ChargeStationAvailabilityType";

interface VehiclesState {
  fetching: number;
  startedFetching: () => void;
  completedFetching: () => void;
  selectedVehicle: Vehicle | undefined;
  setSelectedVehicle: (vehicle: Vehicle | undefined) => void;
  selectedChargeStation: ChargeStation & Partial<{ availability: ChargeStationAvailability; }> | undefined;
  setSelectedChargeStation: (chargeStation: ChargeStation & Partial<{ availability: ChargeStationAvailability; }> | undefined) => void;
}

export const useAppState = create<VehiclesState>(
  (set) => ({
    fetching: 0,
    startedFetching: () => set((state) => ({ fetching: state.fetching + 1 })),
    completedFetching: () => set((state) => ({ fetching: Math.max(state.fetching - 1, 0) })),
    selectedVehicle: undefined,
    setSelectedVehicle: (selectedVehicle: Vehicle | undefined) => set({ selectedVehicle }),
    selectedChargeStation: undefined,
    setSelectedChargeStation: (selectedChargeStation: ChargeStation | undefined) => set({ selectedChargeStation }),
  }),
);