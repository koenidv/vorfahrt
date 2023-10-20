//@ts-ignore react-native-randombytes is not typed; just one function returning a number
import { randomBytes } from "react-native-randombytes";
import { BASE_URL } from './config';

export class DeviceKey {
    private static deviceKey: string;

    private constructor() { }

    /**
     * Retrieves the current deviceKey or generates a new one
     * @returns enabled deviceKey for Miles API
     */
    // fixme should only update once a day or so
    public static async getCurrent() {
        if (!this.deviceKey) {
            this.deviceKey = await this.generateDeviceKey();
        }
        return this.deviceKey;
    }

    /**
     * Generates and enables a new random deviceKey
     * Uses a random 64bit hex string (Android ID)
     * @returns Enabled deviceKey for Miles API
     */
    private static async generateDeviceKey(): Promise<string> {
        console.log("Generating new deviceKey");
        const key = randomBytes(8).toString("hex");
        await this.fetchUserHello(key);
        return key;
    }
    
    /**
     * Call Miles' UserHello enpoint to enable key
     * @param key any deviceKey, for Android ID 64bit hex string
     * @returns UserHello response
     */
    private static async fetchUserHello(key: string): Promise<any> {
        return await fetch(
            `${BASE_URL}/UserHello?` + new URLSearchParams({
                deviceKey: key,
                ownerName: "unknown",
                deviceInfo1: "Android",
                deviceInfo2: "Sharpfin",
                osInfo1: "Android",
                osInfo2: "13",
                appVersion: "4.24+(210373)",
                lang: "en",
                translationDictionaryTimestamp: "2030-01-01T12:00:00:000",
                cityAreasTimestamp: "2030-01-01T12:00:00:000",
            }),
        );
    }
}