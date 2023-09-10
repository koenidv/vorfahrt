import fs from "fs"
import { join } from "path"

import * as xml2js from 'xml2js';

import { SPRITESHEET_REGEX, spriteSheetDir } from "./options";

/**
 * ```ts
 * parseSpritesheet("vorfahrt.spritesheet.VehicleMarker.svg");
 * ```
 */
export default async function parseSpritesheet(spritesheetId: string) {

    const spritesheetName = spritesheetId.match(SPRITESHEET_REGEX)?.[1];

    if (!spritesheetName) {
        throw new Error(`not a valid spritesheet: "${spritesheetId}"`);
    }
    const spritesheetPath = join(spriteSheetDir, spritesheetId);

    const spritesheetOutDir = join(spriteSheetDir, spritesheetName);

    const spritesheetStr = fs.readFileSync(spritesheetPath, "utf8");

    return new Promise<void>(resolve => {

        // Parse the SVG XML content
        xml2js.parseString(spritesheetStr, (err, result) => {
            if (err) {
                console.error('Failed to parse SVG:', err);
                return;
            }

            // Loop through each <g> (group) tag
            for (const group of result.svg.g[0].g || []) {
                const groupName = group['$'].id;
                const groupFolder = join(spritesheetOutDir, groupName);

                fs.mkdirSync(groupFolder, { recursive: true });

                // Loop through each nested <g> tag inside the group
                for (const subGroup of group.g || []) {
                    const subGroupName = subGroup['$'].id;
                    const subGroupContent = new xml2js.Builder().buildObject({
                        svg: {
                            $: {
                                // width: "100%",
                                // height: "100%",
                                width: 120,
                                height: 120,
                                // viewBox: "0 0 1179 1025", // old spritesheet dimensions
                                viewBox: "0 0 120 120", // marker dimensions
                                // viewBox: "0 0 1040 968", // new spritesheet dimensions
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
            resolve();
        });
    });
}