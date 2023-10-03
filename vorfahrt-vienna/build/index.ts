
import parseSpritesheet from "./parseSpritesheet";

import { parseConfig } from "./parseConfig";
import { checkConfigEntitiesExist } from "./checkConfigEntitiesExist";
import { mergeSpritesFromConfig } from "./mergeSpritesFromConfig";
import { rasterizeWriteSprites } from "./rasterizeWriteSpites";
import { writeIndexFile } from "./writeImportMap";

async function main() {

    const spritesDir = await parseSpritesheet("VehicleMarker.spritesheet.svg");
    const config = await parseConfig("VehicleMarker.config.json");
    await checkConfigEntitiesExist(config, spritesDir);

    const merged = mergeSpritesFromConfig(config, spritesDir);
    const writtenSprites = await rasterizeWriteSprites(merged);
    // todo check if filenames are unique

    await writeIndexFile(writtenSprites);

    console.info("Done!");
}
main();