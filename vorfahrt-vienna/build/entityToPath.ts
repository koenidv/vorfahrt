import { join } from "path";

export const entityToPath = (entityKey: string, spritesDir) => {
    const modified = entityKey.replace(/[\s\.-]/g, "");
    if (modified.indexOf("\\") === -1 && modified.indexOf("/") === -1) {
        return join(spritesDir, "vehicle_types", modified + ".svg")
    }
    return join(spritesDir, modified + ".svg")
}

export const entityToSymbolId = (entityKey: string) => {
    const lastSlash = Math.max(entityKey.lastIndexOf("/"), entityKey.lastIndexOf("\\"));
    return entityKey.substring(lastSlash + 1);
}