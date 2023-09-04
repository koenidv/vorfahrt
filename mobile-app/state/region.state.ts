import { create } from "zustand";
import { Region } from "react-native-maps";

interface RegionState {
  current: Region;
  setCurrent: (region: Region) => void;
  updateCurrent: (region: Partial<Region>) => void;
}

const regionState = create<RegionState>(
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

export const useRegion = regionState.getState;
export const useSetRegion = regionState.getState().setCurrent;
export const useUpdateRegion = regionState.getState().updateCurrent;
