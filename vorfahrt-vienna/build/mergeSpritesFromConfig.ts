import { entityToPath } from "./entityToPath";
import { ORIGINAL_MARKER_SIZE } from "./options";
import { Sprite } from "./parseSpritesheet";
import svgstore from "svgstore";
import fs from "fs";


export function mergeSpritesFromConfig(config: any, spritesDir: string) {

    let markers: Sprite[] = [];

    for (const [key, value] of Object.entries(config)) {
        markers.push(...createSpriteFromConfigObject(key, value, createSvgStore(), spritesDir));
    }

    return removeSymbols(markers);

    // todo remember included entities for naming 

    //         markers.push({
    //             symbolName: (vehicleType.fileNameWithoutExtension + "_" + chargeState.fileNameWithoutExtension).replace(/\s/g, "_").replace(/\./g, "_"),
    //             objPath: [vehicleType.fileNameWithoutExtension, chargeState.fileNameWithoutExtension],
    //             importPath: vehicleType.fileNameWithoutExtension + "_" + chargeState.fileNameWithoutExtension + ".svg",
    //             contents,
    //         });
}

/**
 * Creates a new empty or pre-filled svgstore
 * @param initial optional initial svg content
 * @returns svgstore instance
 */
function createSvgStore(initial?: any) {
    const svg = svgstore({
        svgAttrs: {
            width: ORIGINAL_MARKER_SIZE,
            height: ORIGINAL_MARKER_SIZE,
        },
        cleanSymbols: true,
    })
    if (initial) {
        svg.add("inherit", initial.toString())
    }
    return svg;
}

/**
 * Recursively creates sprites from a config object
 * @param key entity name
 * @param value contained entities
 * @param current current state of the sprite
 * @param spritesDir assets directory
 * @returns combined sprites
 */
function createSpriteFromConfigObject(key: string, value: any, current: any /*svgstore*/, spritesDir: string) {
    const sprites: any[] = [];
    console.log(key)

    current.add(key, fs.readFileSync(entityToPath(key, spritesDir)));
    if (typeof value === 'object') {
        for (const [newKey, newValue] of Object.entries(value)) {
            sprites.push(...createSpriteFromConfigObject(newKey, newValue, createSvgStore(current), spritesDir))
        }
    } else {
        sprites.push(current)
    }
    return sprites;
}

/**
 * Removes symbol tags from svg as this makes the elements invisible
 * svgstore insists on using symbols, so removing them here
 * @param sprites svgstore sprites
 * @returns strings of svg content
 */
function removeSymbols(sprites: any[]) {
    return sprites.map((sprite: any) =>
        sprite.toString().replace(/<symbol\s+id=".*"\s+viewBox="\d+\s+\d+\s+\d+\s+\d+">/g, "").replace(/<\/symbol>/g, ""));
}