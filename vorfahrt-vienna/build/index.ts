import fs from "fs"
import { join, parse } from "path"

import sharp from "sharp"
import svgstore from "svgstore"
import parseSpritesheet, { Sprite } from "./parseSpritesheet";

import { getTypescriptImportMap, getVehicleMarkerImportMap } from "./getImportMap"
import { FileInfo } from "./types"
import { MARKER_SIZE, ORIGINAL_MARKER_SIZE, OUTPUT_SVGS, assetmapOutDir, markerDir, markersPngOutDir, markersSvgOutDir } from "./options";

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

function getVehicleMarkers(background: FileInfo, vehicleTypes: FileInfo[], vehicleStatuses: FileInfo[], chargestatesCombustion: FileInfo[], chargestatesElectric: FileInfo[]) {

    let markers: Sprite[] = [];

    for (const vehicleType of vehicleTypes) {

        for (const status of vehicleStatuses) {

            for (const chargeState of chargestatesCombustion) {

                const contents = svgstore({
                    svgAttrs: {
                        width: ORIGINAL_MARKER_SIZE,
                        height: ORIGINAL_MARKER_SIZE,
                    },
                    cleanSymbols: true,
                })
                    .add('background', background.contents)
                    .add("type", vehicleType.contents)
                    .add("status", status.contents)
                    .add("chargeState", chargeState.contents)
                    .toString()
                    /**
                     * svgstore insists on using symbols instead of just putting the svgs into the the top level tag...
                     */
                    .replace(/<symbol\s+id=".*"\s+viewBox="\d+\s+\d+\s+\d+\s+\d+">/g, "").replace(/<\/symbol>/g, "");

                markers.push({
                    symbolName: (vehicleType.fileNameWithoutExtension + "_" + status.fileNameWithoutExtension + "_" + chargeState.fileNameWithoutExtension).replace(/\s/g, "_").replace(/\./g, "_"),
                    objPath: [vehicleType.fileNameWithoutExtension, status.fileNameWithoutExtension, chargeState.fileNameWithoutExtension],
                    importPath: vehicleType.fileNameWithoutExtension + "_" + status.fileNameWithoutExtension + "_" + chargeState.fileNameWithoutExtension + ".svg",
                    contents,
                });
            }
            for (const chargeState of chargestatesElectric) {

                const contents = svgstore({
                    svgAttrs: {
                        width: ORIGINAL_MARKER_SIZE,
                        height: ORIGINAL_MARKER_SIZE,
                    },
                    cleanSymbols: true,
                })
                    .add('background', background.contents)
                    .add("type", vehicleType.contents)
                    .add("status", status.contents)
                    .add("chargeState", chargeState.contents)
                    .toString()
                    /**
                     * svgstore insists on using symbols instead of just putting the svgs into the the top level tag...
                     */
                    .replace(/<symbol\s+id=".*"\s+viewBox="\d+\s+\d+\s+\d+\s+\d+">/g, "").replace(/<\/symbol>/g, "");

                markers.push({
                    symbolName: (vehicleType.fileNameWithoutExtension + "_" + status.fileNameWithoutExtension + "_" + chargeState.fileNameWithoutExtension).replace(/\s/g, "_").replace(/\./g, "_"),
                    objPath: [vehicleType.fileNameWithoutExtension, status.fileNameWithoutExtension, chargeState.fileNameWithoutExtension],
                    importPath: vehicleType.fileNameWithoutExtension + "_" + status.fileNameWithoutExtension + "_" + chargeState.fileNameWithoutExtension + ".svg",
                    contents,
                });
            }
        }
    }
    return markers;
}

async function main() {

    await parseSpritesheet("VehicleMarker.spritesheet.svg");

    const backgrounds = getFullPaths(join(markerDir, "backgrounds/"));
    const vehicleStatuses = getFullPaths(join(markerDir, "vehicle_status/"));
    const chargestatesCombustion = getFullPaths(join(markerDir, "chargestates_combustion/"));
    const chargestatesElectric = getFullPaths(join(markerDir, "chargestates_electric/"));
    const modifiers = getFullPaths(join(markerDir, "modifiers/"));
    const vehicleTypes = getFullPaths(join(markerDir, "vehicle_types/"));

    fs.mkdirSync(assetmapOutDir, { recursive: true });
    fs.mkdirSync(markersPngOutDir, { recursive: true });
    fs.mkdirSync(markersSvgOutDir, { recursive: true });

    const vehicleMarkers = getVehicleMarkers(backgrounds[2], vehicleTypes, vehicleStatuses, chargestatesCombustion, chargestatesElectric);

    for (const [idx, marker] of vehicleMarkers.entries()) {

        console.info(`rasterizing marker ${idx}/${vehicleMarkers.length}`);

        const pngPath = join(markersPngOutDir, marker.importPath).replace(".svg", ".png");

        if (OUTPUT_SVGS) {
            const svgPath = join(markersSvgOutDir, marker.importPath);
        
            fs.writeFileSync(svgPath, marker.contents);
        }

        try {
            await new Promise<void>(res => sharp(Buffer.from(marker.contents, 'utf8'))
                .resize(MARKER_SIZE)
                .toFormat('png')
                .toFile(pngPath, (err) => {
                    if (err) {
                        console.error(`ERROR: sharp failed to rasterize marker: "${marker.symbolName}"`);

                        throw err;
                    }
                    res();
                }));
        } catch (err) {
            console.error(`ERROR: failed to rasterize marker: "${marker.symbolName}"`)
        }
    }

    /**
     * TODO: change importPaths for assetMap
     */
    fs.writeFileSync(join(assetmapOutDir, "VehicleMarker.assetMap.ts"), getTypescriptImportMap("VehicleMarker", vehicleMarkers.map(i => ({
        ...i,
        importPath: "../../dist/" + i.importPath
    }))));

    console.info("done");

    process.exit(0);

    fs.writeFileSync(join(assetmapOutDir, "VehicleMarker.assetMap.ts"), getVehicleMarkerImportMap(vehicleTypes, chargestatesElectric));

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
            .add('background', backgrounds[2].contents)
            .add("chargeState", chargeState.contents)
            .add("type", vehicleType.contents);

        const fileName = `${chargeState.fileName}.${vehicleType.fileName}`.replace(/\.svg/g, "");

        const svgPath = join(markersSvgOutDir, fileName) + ".svg";
        const pngPath = join(markersPngOutDir, fileName) + ".png";

        /**
         * svgstore insists on using symbols instead of just putting the svgs into the the top level tag...
         */
        const contentsWithoutSymbols = contents.toString().replace(/<symbol\s+id=".*"\s+viewBox="\d+\s+\d+\s+\d+\s+\d+">/g, "").replace(/<\/symbol>/g, "");

        fs.writeFileSync(svgPath, contentsWithoutSymbols);

        await new Promise<void>(res => sharp(svgPath)
            .resize(MARKER_SIZE)
            .toFormat('png')
            .toFile(pngPath, (err) => {
                if (err) {
                    console.error(`ERROR: failed to rasterize marker: "${svgPath}"`);

                    throw err;
                }
                res();
            }));
    });
}
main();