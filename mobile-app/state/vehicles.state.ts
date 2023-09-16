import { create } from "zustand";
import { type Vehicle } from "../lib/Miles/types";
import { mergeVehiclesForRegion } from "../lib/mergeVehiclesForRegion";
import { Region } from "react-native-maps";

interface VehiclesState {
  vehicles: Vehicle[];
  updateVehicles: (vehicles: Vehicle[], region: Region) => void;
  clearVehicles: () => void;
  removeVehicle: (vehicle: Vehicle) => void;
}

export const useVehicles = create<VehiclesState>(
  (set) => ({
    vehicles: [],
    updateVehicles: (vehicles, region) => set((current) => ({ vehicles: mergeVehiclesForRegion(current.vehicles, vehicles, region) })),
    clearVehicles: () => set({ vehicles: [] }),
    removeVehicle: (vehicle) =>
      set((state) => ({
        vehicles: state.vehicles.filter((v) => v.id !== vehicle.id),
      })),
  }),
);