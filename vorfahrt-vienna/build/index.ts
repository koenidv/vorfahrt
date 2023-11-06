
import parseSpritesheet from "./parseSpritesheet";

import ConfigParser from "./ConfigParser";
import { checkConfigEntitiesExist } from "./checkConfigEntitiesExist";
import { mergeSpritesFromConfig } from "./mergeSpritesFromConfig";
import { rasterizeWriteSprites } from "./rasterizeWriteSpites";
import { writeIndexFile } from "./writeImportMap";
import { spriteSheetDir } from "./options";
import { join } from "path";

async function main() {

    const config = new ConfigParser(join(spriteSheetDir, "VehicleMarker.config.json")).parseConfig();
    const spritesDir = await parseSpritesheet(join(spriteSheetDir, config.spritesheet));
    await checkConfigEntitiesExist(config.build, spritesDir);

    const merged = mergeSpritesFromConfig(config.build, spritesDir);
    const writtenSprites = await rasterizeWriteSprites(merged);
    // todo check if filenames are unique

    await writeIndexFile(writtenSprites);

    console.info("Done!");
}
main();