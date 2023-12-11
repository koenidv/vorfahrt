import parseSpritesheet from "./parseSpritesheet";
import ConfigParser from "./ConfigParser";
import { checkConfigEntitiesExist } from "./checkConfigEntitiesExist";
import { mergeSpritesFromConfig } from "./mergeSpritesFromConfig";
import { WrittenSprite, rasterizeWriteSprites } from "./rasterizeWriteSpites";
import { writeIndexFile } from "./writeImportMap";
import { spriteSheetDir } from "./options";
import { join } from "path";
import { readdirSync } from "fs";

async function main() {

    const files = readdirSync(spriteSheetDir).filter(name => name.endsWith('.config.json'));
    console.log("Found", files.length, "config files");

    // todo codegen does not support multiple files yet

    let allWrittenSprites: WrittenSprite[] = [];
    for (const configFile of files) {
        console.log("\x1b[33mProcessing", configFile, "\x1b[0m")
        const config = new ConfigParser(join(spriteSheetDir, configFile)).parseConfig();
        const spritesDir = await parseSpritesheet(join(spriteSheetDir, config.spritesheet));
        await checkConfigEntitiesExist(config.build, spritesDir);

        const merged = mergeSpritesFromConfig(config.build, spritesDir);
        const writtenSprites = await rasterizeWriteSprites(merged);
        // todo check if filenames are unique
        allWrittenSprites.push(...writtenSprites);
    }
    await writeIndexFile(allWrittenSprites);

    console.info("Done!");
}
main();