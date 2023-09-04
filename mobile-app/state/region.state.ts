import { create } from "zustand";
import { Region } from "react-native-maps";

interface RegionState {
  current: Region;
  setCurrent: (region: Region) => void;
  updateCurrent: (region: Partial<Region>) => void;
}

export const useRegion = create<RegionState>(
  (set) => ({
    current: {
      latitude: 52.5277672,
      longitude: 13.3767757,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    },
    setCurrent: (region) => set({ current: region }),
    updateCurrent: (region) => set((state) => ({ current: { ...state.current, ...region } })),
  }),
);