import fs from "fs"
import { join, parse } from "path"

import * as xml2js from 'xml2js';

import { SPRITESHEET_REGEX, spriteSheetDir } from "./options";

import { checkObjectPropertiesRecursively } from "./checkObjectPropertiesRecursively"

export interface Sprite {
    contents: string,
    importPath: string,
}

/**
 * ```ts
 * parseSpritesheet("VehicleMarker.spritesheet.svg");
 * ```
 */
export default async function parseSpritesheet(spritesheetPath: string) {
    console.info(`Parsing spritesheet ${spritesheetPath}`);

    const spritesheetName = spritesheetPath.match(SPRITESHEET_REGEX)?.[1];

    if (!spritesheetName) {
        console.error(`ERROR: not a valid spritesheet: "${spritesheetPath}"`);

        throw new Error("INVALID_SPRITESHEET_ID");
    }

    const spritesheetOutDir = join(spriteSheetDir, spritesheetName);

    const spritesheetStr = fs.readFileSync(spritesheetPath, "utf8");

    const parsedSprites = await new Promise<Sprite[]>(resolve => {

        let sprites: Sprite[] = [];

        xml2js.parseString(spritesheetStr, (err, result) => {
            if (err) {
                console.error('ERROR: failed to parse spritesheet as svg:', err);

                throw new Error("SPRITESHEET_PARSE_FAILURE");
            }
            const sheetContainer = result.svg.g.find(i => i["$"].id === parse(spritesheetPath).name);

            for (const spriteGroup of sheetContainer.g || []) {
                const groupName = spriteGroup['$'].id;
                const groupFolder = join(spritesheetOutDir, groupName);

                console.info("Found sprites:", spriteGroup.g.length, groupName, "in", parse(spritesheetPath).name);

                for (const sprite of spriteGroup.g || []) {

                    const spriteName = sprite['$'].id;

                    //console.info("Found sprite:", spriteName);

                    const spriteX = sprite.rect?.[0]?.["$"]?.x;
                    const spriteY = sprite.rect?.[0]?.["$"]?.y;
                    const spriteWidth = sprite.rect?.[0]?.["$"]?.width;
                    const spriteHeight = sprite.rect?.[0]?.["$"]?.height;

                    if (spriteX == null || spriteY == null || spriteWidth == null || spriteHeight == null) {
                        console.error(`ERROR: no rect node found in sprite "${groupName}/${spriteName}".\neach sprite must include a rectangle in order to be able to determine its position and bouding box.\nto fix this, apply a visible stroke of any color (not transparent) to all your sprites in figma, and re-export spritesheet "${spritesheetPath}".\ndon't worry, the stroke will not be visible on the rendered icons.`);

                        throw new Error("MISSING_RECT_NODE_IN_SPRITE");
                    }
                    const spriteTransform = `translate(-${spriteX} -${spriteY})`;

                    /**
                     * TODO: can we skip the transform in favor of just resizing the viewbox like this?
                     * 
                     * const viewBox = `${Math.floor(spriteX)} ${Math.floor(spriteY)} ${Math.floor(spriteX) + 120} ${Math.floor(spriteY) + 120}`
                     */
                    const viewBox = `0 0 ${spriteWidth} ${spriteHeight}`;

                    sprite["$"].transform = spriteTransform;

                    delete sprite.rect;

                    checkObjectPropertiesRecursively(sprite, (key) => {
                        if (key.toLowerCase() === "text") {
                            console.error(`WARNING: text node found in sprite "${groupName}/${spriteName}".\nunflattened text will make the rendered icon look different from your figma design.\nto fix this, flatten the text layer in figma via right click => "Flatten", and re-export spritesheet "${spritesheetPath}".`);
                        }
                    });
                    /**
                     * otherwise the border of the chargestates has a black fill by default
                     */
                    if (sprite.path?.[0] && !sprite.path[0]["$"].fill) {
                        sprite.path[0]["$"].fill = "none"
                    }

                    const spriteContent = new xml2js.Builder().buildObject({
                        svg: {
                            $: {
                                width: spriteWidth,
                                height: spriteHeight,
                                viewBox,
                                fill: "none",
                                xmlns: "http://www.w3.org/2000/svg",
                            },
                            g: [
                                {
                                    $: { id: spriteName },
                                    ...sprite
                                }
                            ]
                        }
                    });
                    sprites.push({
                        importPath: join(groupName, spriteName.replace(/[\s\.-]/g, "") + ".svg"),
                        contents: spriteContent,
                    });
                }
            }
            resolve(sprites);
        });
    });

    const outDir = join(__dirname, "../tmp/spritesheets/", spritesheetName);

    await fs.promises.mkdir(outDir, { recursive: true });

    for (const sprite of parsedSprites) {
        await fs.promises.mkdir(parse(join(outDir, sprite.importPath)).dir, { recursive: true });
        await fs.promises.writeFile(join(outDir, sprite.importPath), sprite.contents);
    }

    return outDir;
}