import fs from "fs"
import { join, parse } from "path"

import sharp from "sharp"
import svgstore from "svgstore"
import parseSpritesheet, { Sprite } from "./parseSpritesheet";

import { getTypescriptImportMap, getVehicleMarkerImportMap } from "./getImportMap"
import { FileInfo } from "./types"
import { MARKER_SIZE, ORIGINAL_MARKER_SIZE, OUTPUT_SVGS, assetmapOutDir, markerDir, markersPngOutDir, markersSvgOutDir } from "./options";
import { parseConfig } from "./parseConfig";
import { checkConfigEntitiesExist } from "./checkConfigEntitiesExist";
import { mergeSpritesFromConfig } from "./mergeSpritesFromConfig";
import { rasterizeWriteSprites } from "./rasterizeWriteSpites";

const getCombinations = <T>(arrays: T[][]): T[][] => {
    if (arrays.length === 0) return [[]];
    const [first, ...rest] = arrays;
    const partials = getCombinations(rest);
    const combinations: T[][] = [];

    for (const value of first) {
        for (const partial of partials) {
            const combination: T[] = [value, ...partial];
            combinations.push(combination);
        }
    }

    return combinations;
}

const getFullPaths = (dir: string): FileInfo[] => {
    const fileNames = fs.readdirSync(dir);

    return fileNames.map(fileName => ({
        fileNameWithoutExtension: parse(fileName).name,
        fileName,
        path: join(dir, fileName),
        contents: fs.readFileSync(join(dir, fileName), "utf8"),
    }));
};

function getVehicleMarkers(background: FileInfo, vehicleTypes: FileInfo[], chargestates: FileInfo[]) {

    let markers: Sprite[] = [];

    for (const vehicleType of vehicleTypes) {

        for (const chargeState of chargestates) {

            const contents = svgstore({
                svgAttrs: {
                    width: ORIGINAL_MARKER_SIZE,
                    height: ORIGINAL_MARKER_SIZE,
                },
                cleanSymbols: true,
            })
                .add('background', background.contents)
                .add("type", vehicleType.contents)
                .add("chargeState", chargeState.contents)
                .toString()
                /**
                 * svgstore insists on using symbols instead of just putting the svgs into the the top level tag...
                 */
                .replace(/<symbol\s+id=".*"\s+viewBox="\d+\s+\d+\s+\d+\s+\d+">/g, "").replace(/<\/symbol>/g, "");

            markers.push({
                symbolName: (vehicleType.fileNameWithoutExtension + "_" + chargeState.fileNameWithoutExtension).replace(/\s/g, "_").replace(/\./g, "_"),
                objPath: [vehicleType.fileNameWithoutExtension, chargeState.fileNameWithoutExtension],
                importPath: vehicleType.fileNameWithoutExtension + "_" + chargeState.fileNameWithoutExtension + ".svg",
                contents,
            });
        }
    }
    return markers;
}

async function main() {

    const spritesDir = await parseSpritesheet("VehicleMarker.spritesheet.svg");
    // const spritesDir = "C:\\Users\\koeni\\Code\\vorfahrt\\vorfahrt-vienna\\spritesheets\\VehicleMarker"
    const config = await parseConfig("VehicleMarker.config.json");
    await checkConfigEntitiesExist(config, spritesDir);

    const merged = mergeSpritesFromConfig(config, spritesDir)
    
    const writtenSprites = await rasterizeWriteSprites(merged);

    process.exit(0);



    const backgrounds = getFullPaths(join(markerDir, "backgrounds/"));
    //const vehicleStatuses = getFullPaths(join(markerDir, "vehicle_status/")); todo ride_status, internal_status
    const chargestates = getFullPaths(join(markerDir, "chargestates/"));
    //const modifiers = getFullPaths(join(markerDir, "modifiers/")); // todo modifiers
    const vehicleTypes = getFullPaths(join(markerDir, "vehicle_types/"));

    fs.mkdirSync(assetmapOutDir, { recursive: true });
    fs.mkdirSync(markersPngOutDir, { recursive: true });
    fs.mkdirSync(markersSvgOutDir, { recursive: true });

    const vehicleMarkers = getVehicleMarkers(backgrounds[0], vehicleTypes, chargestates);

    /**
     * TODO: change importPaths for assetMap
     */
    fs.writeFileSync(join(assetmapOutDir, "VehicleMarker.assetMap.ts"), getTypescriptImportMap("VehicleMarker", vehicleMarkers.map(i => ({
        ...i,
        importPath: "../../dist/" + i.importPath
    }))));

    console.info("done");
}
main();