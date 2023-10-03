import { join } from "path";
import { indexOutDir } from "./options";
import { WrittenSprite } from "./rasterizeWriteSpites";
import fs from "fs";

export type exportsType = {
    symbolName: string,
    entities: string[],
}

export async function writeIndexFile(sprites: WrittenSprite[]) {
    const indexFile = getIndexFile(sprites);
    await fs.promises.mkdir(indexOutDir, { recursive: true });
    return fs.promises.writeFile(join(indexOutDir, "index.js"), indexFile, "utf8");
}

export function getIndexFile(sprites: WrittenSprite[]) {
    console.info("Generating index file");
    const importStatements: string[] = [];
    const exports: exportsType[] = [];

    for (const sprite of sprites) {
        const symbolName = sprite.filename + "__" + sprite.filetype;
        importStatements.push(`import ${symbolName} from "${sprite.path.replace(indexOutDir, "./").replace(/\\/g, "\\\\")}";`)
        exports.push({
            symbolName,
            entities: sprite.entities,
        })
    }

    let indexFile = "// This file was generated by vorfahrt/vienna at " + new Date().toISOString() + "\n\n";
    indexFile += importStatements.join("\n") + "\n\n";
    indexFile += "export const exports = " + symbolNamesToSymbols(exports) + ";\n\n";
    indexFile += "export default " + findIcon.toString();

    return indexFile;
}

/**
 * Removes quotation marks around symbolNames
 */
function symbolNamesToSymbols(exports: exportsType[]) {
    return JSON.stringify(exports, null, 4).replace(/\"symbolName\":\s?\"(?<symbol>[\w\d_]+)\"/g, "\"symbolName\": $<symbol>");
}



// todo: error handling if icon is not found
// todo generate d.ts file
/**
 * This function is included in the index.js file, not used during build
 */
function findIcon(filetype, entities) {
    console.log(entities)
    const candidates = exports.filter(el => 
        el.filetype === filetype && 
        entities.every(i => el.entities.map(eli => eli.toLowerCase()).includes(i.toLowerCase())));
    if (candidates.length === 0) {
        console.log("no candidates found for", filetype, entities)
        return;
    }
    console.log(candidates)
    // select the candidate with the least entities → highest % match
    const bestCandidate = candidates.reduce((prev, curr) => prev.entities.length < curr.entities.length ? prev : curr);
    return bestCandidate.symbolName;
}
