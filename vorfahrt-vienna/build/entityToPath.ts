import { join } from "path";

export const entityToPath = (entityKey: string, spritesDir) => {
    if (entityKey.indexOf("\\") === -1) {
        return join(spritesDir, "vehicle_types", entityKey + ".svg")
    }
    return join(spritesDir, entityKey + ".svg")
}
    