import fs from "fs"
import { entityToPath } from "./entityToPath";

export async function checkConfigEntitiesExist(config: any, spritesDir: string) {
    const entities = getAllKeys(config);
    for(const entity of entities) {
        const exists = fs.existsSync(entityToPath(entity, spritesDir));
        if (!exists) {
            throw Error(`Entity "${entityToPath(entity, spritesDir)}" does not exist in spritesheet directory`);
        }    
    }
}

/**
 * Recursively retrieves all keys from an object
 * @param obj nested object like {a: {b: {c: 1}}}
 * @returns keys array like ["a", "b", "c"]
 */
export function getAllKeys(obj: any): string[] {
    return [...new Set(Object.keys(obj).flatMap(key => {
        if (typeof obj[key] === 'object') {
            return [key, ...getAllKeys(obj[key])];
        }
        return key;
    }))];
}