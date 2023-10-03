import { join } from "path";
import { spriteSheetDir } from "./options";
import fs from "fs";

/**
 * Maps the allVehicles config onto each vehicle
 * @param configName file name of the config file in the spritesheets dir
 * @returns Object of vehicle configs
 */
export async function parseConfig(configName: string) {
    const configPath = join(spriteSheetDir, configName);
    const config = JSON.parse(await fs.promises.readFile(configPath, "utf8"));
    const allVehiclesConfig = config.allVehicles

    let vehicles = {}

    for (const [vehicleName, vehicleConfig] of Object.entries(config.vehicles)) {
        vehicles[vehicleName] = deepMerge(allVehiclesConfig, vehicleConfig);
    }

    if (config?.options?.switchFirstAndSecondDepth === true) {
        vehicles = switchFirstAndSecondDepth(vehicles);
    }

    return vehicles;
}

/**
 * Recursively deeply merges two objects
 * @param obj1 base object
 * @param obj2 (nested) keys will override obj1
 */
export function deepMerge(obj1: any, obj2: any): any {
    const result = { ...obj1 };

    for (const key in obj2) {
        if (obj2.hasOwnProperty(key)) {
            if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
                result[key] = deepMerge(obj1[key], obj2[key]);
            } else {
                if (obj2[key] === true && obj1[key]) result[key] = obj1[key];
                else result[key] = obj2[key];
            }
        }
    }
    return result;
}

/**
 * Switches the first and second leaf depth of an object
 * eg {a: {b: {c: 1}, d: 2}} => {b: {a: {c: 1}}, d: {a: 2}} 
 */
export function switchFirstAndSecondDepth(obj: any): any {
    if (typeof obj !== 'object') {
        return obj;
    }

    const result: any = {};

    for (const majorkey of Object.keys(obj)) {
        for (const [minorkey, minorvalue] of Object.entries(obj[majorkey])) {
            result[minorkey] = { ...result[minorkey], [majorkey]: minorvalue };
        }
    }

    return result;
}