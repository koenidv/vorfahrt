import { create } from "zustand";
import { apiCluster } from "../lib/Miles/apiTypes";

interface VehiclesState {
  clusters: apiCluster[];
  setClusters: (clusters: apiCluster[]) => void;
  clearClusters: () => void;
}

export const useClusters = create<VehiclesState>(
  (set) => ({
    clusters: [],
    setClusters: (clusters) => set((current) => ({ clusters: clusters })),
    clearClusters: () => set({ clusters: [] }),
  }),
);