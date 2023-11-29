import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ChargeStation } from "../lib/Miles/types";

interface UserdataState {
  hiddenChargeStations: ChargeStation[];
  addHiddenChargeStation: (chargeStation: ChargeStation) => void;
  removeHiddenChargeStation: (chargeStation: ChargeStation) => void;
  resetHiddenChargeStations: () => void;
  filterChargeStations: (chargeStations: ChargeStation[]) => ChargeStation[];
}

export const useUserdata = create<UserdataState>()(
  persist(
    (set, get) => ({
      hiddenChargeStations: [],
      addHiddenChargeStation: (chargeStation) =>
        set((state) => ({
          hiddenChargeStations: [...state.hiddenChargeStations, chargeStation],
        })),
      removeHiddenChargeStation: (chargeStation) =>
        set((state) => ({
          hiddenChargeStations: state.hiddenChargeStations.filter(
            (station) => station.milesId !== chargeStation.milesId
          ),
        })),
      resetHiddenChargeStations: () =>
        set({
          hiddenChargeStations: [],
        }),
      filterChargeStations: (chargeStations) =>
        chargeStations.filter(
          (station) =>
            !get().hiddenChargeStations.find(
              (hiddenStation) => hiddenStation.milesId === station.milesId
            )
        ),
    }),
    {
      name: "userdata",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);