import fs from "fs"
import { join } from "path"

import sharp from "sharp"
import svgstore from "svgstore"
import * as xml2js from 'xml2js';


const rawAssetsDir = join(__dirname, "../assets/");
const markerDir = join(rawAssetsDir, "Marker/");

const pngOutDir = join(__dirname, "../dist/png/");
const svgOutDir = join(__dirname, "../dist/svg/");

const markersPngOutDir = join(pngOutDir, "markers/");
const markersSvgOutDir = join(svgOutDir, "markers/");

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

const getFullPaths = (dir: string) => {
    const fileNames = fs.readdirSync(dir);

    return fileNames.map(fileName => ({
        fileName,
        path: join(dir, fileName),
        contents: fs.readFileSync(join(dir, fileName), "utf8"),
    }));
};

async function main() {

    const background = fs.readFileSync(join(markerDir, "background.svg"), "utf8");

    const chargeStates = getFullPaths(join(markerDir, "chargestate/"));
    const chargeStations = getFullPaths(join(markerDir, "chargestation/"));
    const types = getFullPaths(join(markerDir, "type/"));
    const vehicleStatuses = getFullPaths(join(markerDir, "vehiclestatus/"));

    const markerCombinations = getCombinations([chargeStates, types]);

    fs.mkdirSync(markersPngOutDir, { recursive: true });
    fs.mkdirSync(markersSvgOutDir, { recursive: true });

    const markers = markerCombinations.map(async i => {

        const [chargeState, type] = i;

        const contents = svgstore({
            svgAttrs: {
                width: 120,
                height: 120,
            },
            cleanSymbols: true,
        })
            .add('background', background)
            .add("chargeState", chargeState.contents)
            .add("type", type.contents);

        const fileName = `${chargeState.fileName}.${type.fileName}`.replace(/\.svg/g, "");

        const svgPath = join(markersSvgOutDir, fileName) + ".svg"
        const pngPath = join(markersPngOutDir, fileName) + ".png"

        /**
         * svgstore insists on using symbols instead of just putting the svgs into the the top level tag...
         */
        fs.writeFileSync(svgPath, contents.toString().replace(/<symbol\s+id=".*"\s+viewBox="\d+\s+\d+\s+\d+\s+\d+">/g, "").replace(/<\/symbol>/g, ""))

        await new Promise<void>(res => sharp(svgPath)
            .resize(120 * 2)
            .toFormat('png')
            .toFile(pngPath, (err, info) => {
                if (err) {
                    console.error('error rasterizing marker:', err);
                }
                res();
            }));
    });
}

async function parseSpritesheet() {

    const svgString = fs.readFileSync("/Users/linusbolls/downloads/Marker.svg", "utf8")

    // Parse the SVG XML content
    xml2js.parseString(svgString, (err, result) => {
        if (err) {
            console.error('Failed to parse SVG:', err);
            return;
        }

        // Assume the root folder name from the first <g> tag
        const rootFolder = join(__dirname, "../parsed/", result.svg.g[0]['$'].id);

        fs.mkdirSync(rootFolder, { recursive: true });

        // Loop through each <g> (group) tag
        for (const group of result.svg.g[0].g || []) {
            const groupName = group['$'].id;
            const groupFolder = join(rootFolder, groupName);
            fs.mkdirSync(groupFolder);

            // Loop through each nested <g> tag inside the group
            for (const subGroup of group.g || []) {
                const subGroupName = subGroup['$'].id;
                const subGroupContent = new xml2js.Builder().buildObject({
                    svg: {
                        $: {
                            width: "100%",
                            height: "100%",
                            viewBox: "0 0 1179 1025",
                            fill: "none",
                            xmlns: "http://www.w3.org/2000/svg"
                        },
                        g: [
                            {
                                $: { id: subGroupName },
                                ...subGroup
                            }
                        ]
                    }
                });
                fs.writeFileSync(
                    join(groupFolder, `${subGroupName}.svg`),
                    subGroupContent
                );
            }
        }
    });
}
main();
parseSpritesheet();