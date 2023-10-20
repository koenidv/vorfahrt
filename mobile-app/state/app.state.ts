import { create } from "zustand";
import { ChargeStation, type Vehicle } from "../lib/Miles/types";
import { mergeVehiclesForRegion } from "../lib/mergeVehiclesForRegion";
import { Region } from "react-native-maps";
import { ChargeStationAvailability } from "../lib/ChargeStationAvailabilityType";

interface VehiclesState {
  fetching: boolean; // fixme this should be the # of running tasks / otherwise bug if one task finishes before another
  setFetching: (fetching: boolean) => void;
  selectedVehicle: Vehicle | undefined;
  setSelectedVehicle: (vehicle: Vehicle | undefined) => void;
  selectedChargeStation: ChargeStation & Partial<{ availability: ChargeStationAvailability; }> | undefined;
  setSelectedChargeStation: (chargeStation: ChargeStation & Partial<{ availability: ChargeStationAvailability; }> | undefined) => void;
}

export const useAppState = create<VehiclesState>(
  (set) => ({
    fetching: false,
    setFetching: (fetching) => set({ fetching }),
    selectedVehicle: undefined,
    setSelectedVehicle: (selectedVehicle: Vehicle | undefined) => set({ selectedVehicle }),
    selectedChargeStation: undefined,
    setSelectedChargeStation: (selectedChargeStation: ChargeStation | undefined) => set({ selectedChargeStation }),
  }),
);