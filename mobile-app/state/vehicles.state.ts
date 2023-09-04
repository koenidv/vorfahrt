import { create } from "zustand";
import { type Vehicle } from "../lib/Miles/types";
import { unionBy } from "lodash";

interface VehiclesState {
  vehicles: Vehicle[];
  updateVehicles: (vehicles: Vehicle[]) => void;
  clearVehicles: () => void;
  removeVehicle: (vehicle: Vehicle) => void;
}

export const useVehicles = create<VehiclesState>(
  (set) => ({
    vehicles: [],
    updateVehicles: (vehicles) => set((current) => ({ vehicles: tempMergeVehicles(current.vehicles, vehicles) })),
    clearVehicles: () => set({ vehicles: [] }),
    removeVehicle: (vehicle) =>
      set((state) => ({
        vehicles: state.vehicles.filter((v) => v.id !== vehicle.id),
      })),
  }),
);

const tempMergeVehicles = (currentVehicles: Vehicle[], newVehicles: Vehicle[]) => {
  // todo properly merge vehicles
  return unionBy(
    currentVehicles,
    newVehicles,
    (v) => v.id,
  );
};