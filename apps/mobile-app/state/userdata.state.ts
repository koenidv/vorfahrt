import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ChargeStation } from "../lib/Miles/types";
import { Region } from "react-native-maps";

interface UserdataState {
  hiddenChargeStations: ChargeStation[];
  addHiddenChargeStation: (chargeStation: ChargeStation) => void;
  removeHiddenChargeStation: (chargeStation: ChargeStation) => void;
  resetHiddenChargeStations: () => void;
  filterChargeStations: (chargeStations: ChargeStation[]) => ChargeStation[];
  savedLocations: (Region & { name: string })[];
  addSavedLocation: (location: Region & { name: string }) => void;
  removeSavedLocation: (location: Region & { name: string }) => void;
  resetSavedLocations: () => void;
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
      savedLocations: [],
      addSavedLocation: (location) =>
        set((state) => ({
          savedLocations: [...state.savedLocations, location],
        })),
      removeSavedLocation: (location) =>
        set((state) => ({
          savedLocations: state.savedLocations.filter(
            (savedLocation) => savedLocation.name !== location.name &&
              savedLocation.latitude !== location.latitude &&
              savedLocation.longitude !== location.longitude
          ),
        })),
      resetSavedLocations: () =>
        set({
          savedLocations: [],
        }),
    }),
    {
      name: "userdata",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);