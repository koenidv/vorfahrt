import { create } from "zustand";
import { VehicleEngine, VehicleSize } from "../lib/Miles/enums";

interface FiltersState {
  maxCharge: number;
  setMaxCharge: (maxCharge: number) => void;
  engineType: VehicleEngine[];
  enableEngineType: (engineType: VehicleEngine) => void;
  disableEngineType: (engineType: VehicleEngine) => void;
  vehicleSize: VehicleSize[];
  enableVehicleSize: (vehicleSize: VehicleSize) => void;
  disableVehicleSize: (vehicleSize: VehicleSize) => void;
  resetAll: () => void;
}

export const useFilters = create<FiltersState>(
  (set) => ({
    maxCharge: 32,
    setMaxCharge: (maxCharge) => set({ maxCharge }),

    engineType: [VehicleEngine.electric],
    enableEngineType: (engineType) =>
      set((state) => ({
        engineType: [...state.engineType, engineType],
      })),
    disableEngineType: (engineType) =>
      set((state) => ({
        engineType: state.engineType.filter((et) => et !== engineType),
      })),

    vehicleSize: [VehicleSize.small, VehicleSize.medium],
    enableVehicleSize: (vehicleSize) =>
      set((state) => ({
        vehicleSize: [...state.vehicleSize, vehicleSize],
      })),
    disableVehicleSize: (vehicleSize) =>
      set((state) => ({
        vehicleSize: state.vehicleSize.filter((vs) => vs !== vehicleSize),
      })),
      
    resetAll: () =>
      set({
        maxCharge: 32,
        engineType: [VehicleEngine.electric],
        vehicleSize: [VehicleSize.small, VehicleSize.medium],
      }),
  }),
);