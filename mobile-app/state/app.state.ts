import { create } from "zustand";
import { ChargeStation, type Vehicle } from "../lib/Miles/types";
import { ChargeStationAvailability } from "../lib/ChargeStationAvailabilityType";
import { Route } from "../lib/Maps/directions";

interface VehiclesState {
  fetching: number;
  startedFetching: () => void;
  completedFetching: () => void;
  selectedVehicle: Vehicle | undefined;
  setSelectedVehicle: (vehicle: Vehicle | undefined) => void;
  selectedChargeStation: ChargeStation & Partial<{ availability: ChargeStationAvailability; }> | undefined;
  setSelectedChargeStation: (chargeStation: ChargeStation & Partial<{ availability: ChargeStationAvailability; }> | undefined) => void;
  walkingDirections: Route | null;
  setWalkingDirections: (route: Route | null) => void;
  drivingDirections: Route | null;
  setDrivingDirections: (route: Route | null) => void;
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
    walkingDirections: null,
    setWalkingDirections: (walkingDirections: Route | null) => set({ walkingDirections }),
    drivingDirections: null,
    setDrivingDirections: (drivingDirections: Route | null) => set({ drivingDirections }),
  }),
);