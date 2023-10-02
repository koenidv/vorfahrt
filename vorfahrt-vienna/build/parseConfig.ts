import { join } from "path";
import { spriteSheetDir } from "./options";

/**
 * Maps the allVehicles config onto each vehicle
 * @param configName file name of the config file in the spritesheets dir
 * @returns Object of vehicle configs
 */
export async function parseConfig(configName: string) {
    const configPath = join(spriteSheetDir, configName);
    const config = await import(configPath);
    const allVehiclesConfig = config.allVehicles


    const vehicles = {}

    for (const [vehicleName, vehicleConfig] of Object.entries(config.vehicles)) {
        vehicles[vehicleName] = deepMerge(allVehiclesConfig, vehicleConfig);
    }

    return vehicles;
}

/**
 * Recursively deeply merges two objects
 * @param obj1 base object
 * @param obj2 (nested) keys will override obj1
 */
export function deepMerge(obj1: any, obj2: any): any {
    if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
        throw new Error("Can only merge objects. Trying to merge" + typeof obj1 + "and" + typeof obj2);
    }

    const result = { ...obj1 };

    for (const key in obj2) {
        if (obj2.hasOwnProperty(key)) {
            if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
                result[key] = deepMerge(obj1[key], obj2[key]);
            } else {
                result[key] = obj2[key];
            }
        }
    }
    return result;
}