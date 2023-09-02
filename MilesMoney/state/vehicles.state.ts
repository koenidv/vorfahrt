import { create } from "zustand";
import { type Vehicle } from "../lib/Miles/types";
import { unionBy } from "lodash";

interface VehiclesState {
  vehicles: Vehicle[];
  setVehicles: (vehicles: Vehicle[]) => void;
  addVehicle: (vehicle: Vehicle) => void;
  clearVehicles: () => void;
  removeVehicle: (vehicle: Vehicle) => void;
}

const vehiclesState = create<VehiclesState>(
  (set) => ({
    vehicles: [],
    setVehicles: (vehicles) => set({ vehicles }),
    addVehicle: (vehicle) =>
      set((state) => ({ vehicles: [...state.vehicles, vehicle] })),
    clearVehicles: () => set({ vehicles: [] }),
    removeVehicle: (vehicle) =>
      set((state) => ({
        vehicles: state.vehicles.filter((v) => v.id !== vehicle.id),
      })),
  }),
);

export const useVehicles = vehiclesState;
export const useUpdateVehicles = (vehicles: Vehicle[]) => {
  const joined = unionBy(
    vehiclesState.getState().vehicles,
    vehicles,
    (v) => v.id,
  );
  vehiclesState.getState().setVehicles(joined);
  // todo properly merge vehicles
};
export const useOverrideVehicles = vehiclesState.getState().setVehicles;

export default vehiclesState;
