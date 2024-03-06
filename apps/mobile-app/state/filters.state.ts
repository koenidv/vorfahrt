import { create } from "zustand";
import { VehicleEngine, VehicleSize } from "../lib/Miles/enums";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface FiltersState {
  chargeOverflow: number;
  setChargeOverflow: (overflow: number) => void;
  engineType: VehicleEngine[];
  setEngineType: (engineType: VehicleEngine[]) => void;
  vehicleSize: VehicleSize[];
  setVehicleSize: (vehicleSize: VehicleSize[]) => void;
  alwaysShowChargingStations: boolean;
  toggleAlwaysShowChargingStations: () => void;
  showNoParkingZones: boolean;
  toggleShowNoParkingZones: () => void;
  resetAll: () => void;
}

export const useFilters = create<FiltersState>()(
  persist(
    (set) => ({
      chargeOverflow: 2,
      setChargeOverflow: (chargeOverflow) => set({ chargeOverflow }),

      engineType: [VehicleEngine.electric],
      setEngineType: (engineType) => set({ engineType }),

      vehicleSize: [VehicleSize.small, VehicleSize.medium],
      setVehicleSize: (vehicleSize) => set({ vehicleSize }),

      alwaysShowChargingStations: false,
      toggleAlwaysShowChargingStations: () =>
        set((state) => ({
          alwaysShowChargingStations: !state.alwaysShowChargingStations,
        })),

      showNoParkingZones: false,
      toggleShowNoParkingZones: () =>
        set((state) => ({
          showNoParkingZones: !state.showNoParkingZones,
        })),

      resetAll: () =>
        set({
          chargeOverflow: 2,
          engineType: [VehicleEngine.electric],
          vehicleSize: [VehicleSize.small, VehicleSize.medium],
          alwaysShowChargingStations: false,
          showNoParkingZones: false,
        }),
    }),
    {
      name: "filters",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);