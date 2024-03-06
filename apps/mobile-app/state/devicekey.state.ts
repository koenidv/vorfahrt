import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface DeviceKeyState {
    deviceKey: string | undefined;
    updatedDate: number;
    setDeviceKey: (deviceKey: string) => void;
    shouldBeUpdated: () => boolean;
}

export const useDeviceKey = create<DeviceKeyState>()(
    persist(
        (set, get) => ({
            deviceKey: undefined,
            updatedDate: 0,
            setDeviceKey: (deviceKey) => set({ deviceKey, updatedDate: new Date().getTime() }),
            shouldBeUpdated: () => {
                return get().deviceKey === undefined || get().updatedDate < new Date().getTime() - 1000 * 3600 * 24 * 5;
            },
        }),
        {
            name: "devicekey",
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);