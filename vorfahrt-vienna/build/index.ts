import fs from "fs"
import { join, parse } from "path"

import sharp from "sharp"
import svgstore from "svgstore"
import parseSpritesheet from "./parseSpritesheet";

import { getVehicleMarkerImportMap } from "./getImportMap"
import { FileInfo } from "./types"
import { MARKER_SIZE, ORIGINAL_MARKER_SIZE, generatedOutputDir, markerDir, markersPngOutDir, markersSvgOutDir } from "./options";

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

async function main() {

    await parseSpritesheet("VehicleMarker.spritesheet.svg");

    const backgrounds = getFullPaths(join(markerDir, "backgrounds/"));
    const chargestatesCombustion = getFullPaths(join(markerDir, "chargestates_combustion/"));
    const chargestatesElectric = getFullPaths(join(markerDir, "chargestates_electric/"));
    const modifiers = getFullPaths(join(markerDir, "modifiers/"));
    const vehicleTypes = getFullPaths(join(markerDir, "vehicle_types/"));

    fs.mkdirSync(generatedOutputDir, { recursive: true });
    fs.mkdirSync(markersPngOutDir, { recursive: true });
    fs.mkdirSync(markersSvgOutDir, { recursive: true });

    fs.writeFileSync(join(generatedOutputDir, "VehicleMarker.assetMap.ts"), getVehicleMarkerImportMap(vehicleTypes, chargestatesElectric));

    const markerCombinations = getCombinations([chargestatesElectric, vehicleTypes]);

    markerCombinations.map(async i => {

        const [chargeState, vehicleType] = i;

        const contents = svgstore({
            svgAttrs: {
                width: ORIGINAL_MARKER_SIZE,
                height: ORIGINAL_MARKER_SIZE,
            },
            cleanSymbols: true,
        })
            .add('background', backgrounds[1].contents)
            .add("chargeState", chargeState.contents)
            .add("type", vehicleType.contents);

        const fileName = `${chargeState.fileName}.${vehicleType.fileName}`.replace(/\.svg/g, "");

        const svgPath = join(markersSvgOutDir, fileName) + ".svg";
        const pngPath = join(markersPngOutDir, fileName) + ".png";

        /**
         * svgstore insists on using symbols instead of just putting the svgs into the the top level tag...
         */
        fs.writeFileSync(svgPath, contents.toString().replace(/<symbol\s+id=".*"\s+viewBox="\d+\s+\d+\s+\d+\s+\d+">/g, "").replace(/<\/symbol>/g, ""))

        await new Promise<void>(res => sharp(svgPath)
            .resize(MARKER_SIZE)
            .toFormat('png')
            .toFile(pngPath, (err, info) => {
                if (err) {
                    console.error('error rasterizing marker:', err);
                }
                res();
            }));
    });
}
main();