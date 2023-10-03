import { join } from "path";

export const entityToPath = (entityKey: string, spritesDir) => {
    if (entityKey.indexOf("\\") === -1 && entityKey.indexOf("/") === -1) {
        return join(spritesDir, "vehicle_types", entityKey + ".svg")
    }
    return join(spritesDir, entityKey + ".svg")
}

export const entityToSymbolId = (entityKey: string) => {
    const lastSlash = Math.max(entityKey.lastIndexOf("/"), entityKey.lastIndexOf("\\"));
    return entityKey.substring(lastSlash + 1);
}