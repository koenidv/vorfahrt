import { entityToPath, entityToSymbolId } from "./entityToPath";
import { ORIGINAL_MARKER_SIZE } from "./options";
import { Sprite } from "./parseSpritesheet";
import svgstore from "svgstore";
import fs from "fs";

type MergedSprite = {
    entities: string[],
    sprite: any, /*svgstore*/
}

export type MergedSpriteFlattened = {
    entities: string[],
    contents: string,
}

/**
 * Merges sprites from the sprite directory according to the config object
 * @param config parsed config object. will create one sprite per leaf
 * @param spritesDir directory of the sprite svgs
 * @returns array of merged sprites, as svgs contents
 */
export function mergeSpritesFromConfig(config: any, spritesDir: string): MergedSpriteFlattened[] {
    let markers: MergedSprite[] = [];

    for (const [key, value] of Object.entries(config)) {
        markers.push(...createSpriteFromConfigObject(key, value, createSprite(), spritesDir));
    }

    return flattenMarkers(markers);

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
function createSprite(initial?: MergedSprite): MergedSprite {
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
    return {
        entities: initial ? [...initial.entities] : [],
        sprite: svg
    };
}

/**
 * Recursively creates sprites from a config object
 * @param key entity name
 * @param value contained entities
 * @param current current state of the sprite
 * @param spritesDir assets directory
 * @returns combined sprites
 */
function createSpriteFromConfigObject(key: string, value: any, current: MergedSprite, spritesDir: string): MergedSprite[] {
    const sprites: any[] = [];
    console.log(key)

    current.entities.push(entityToSymbolId(key));
    current.sprite.add(key, fs.readFileSync(entityToPath(key, spritesDir)));
    if (typeof value === 'object') {
        for (const [newKey, newValue] of Object.entries(value)) {
            sprites.push(...createSpriteFromConfigObject(newKey, newValue, createSprite(current), spritesDir))
        }
    } else {
        if (value == true) { // loose equality for more flexible config
            sprites.push(current)
        }
    }
    return sprites;
}

/**
 * Removes symbol tags from svg as this makes the elements invisible
 * svgstore insists on using symbols, so removing them here
 * @param sprites svgstore sprites
 * @returns strings of svg content
 */
function flattenMarkers(mergedSprites: MergedSprite[]) {
    return mergedSprites.map((merged: MergedSprite) => ({
        entities: merged.entities,
        contents: merged.sprite.toString().replace(/<symbol\s+id=".*"\s+viewBox="\d+\s+\d+\s+\d+\s+\d+">/g, "").replace(/<\/symbol>/g, "")
    }));
}