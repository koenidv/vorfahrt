import { join } from "path";
import { indexOutDir } from "./options";
import { WrittenSprite } from "./rasterizeWriteSpites";
import fs from "fs";

export type exportsType = {
    symbolName: string,
    entities: string[],
    filetype: "png" | "svg",
}

export async function writeIndexFile(sprites: WrittenSprite[]) {
    const { indexFile, declarationFile } = getIndexFile(sprites);
    await fs.promises.mkdir(indexOutDir, { recursive: true });
    await fs.promises.writeFile(join(indexOutDir, "index.js"), indexFile, "utf8");
    await fs.promises.writeFile(join(indexOutDir, "index.d.ts"), declarationFile, "utf8");
}

export function getIndexFile(sprites: WrittenSprite[]) {
    console.log("\x1b[33mGenerating index file\x1b[0m")
    const importStatements: string[] = [];
    const exports: exportsType[] = [];
    const fileTypes: Set<string> = new Set();
    const entityTypes: Set<string> = new Set();

    for (const sprite of sprites) {
        const symbolName = sprite.filename + "__" + sprite.filetype;
        importStatements.push(`import ${symbolName} from "${sprite.path.replace(indexOutDir, "./").replace(/\\/g, "\\\\")}";`)
        exports.push({
            symbolName,
            entities: sprite.entities,
            filetype: sprite.filetype,
        })
        fileTypes.add(sprite.filetype);
        for (const entity of sprite.entities) {
            entityTypes.add(entity);
        }
    }

    let indexFile = "// This file was generated by vorfahrt/vienna at " + new Date().toISOString() + "\n\n";
    indexFile += importStatements.join("\n") + "\n\n";
    indexFile += "export const exports = " + symbolNamesToSymbols(exports) + ";\n\n";
    indexFile += "export " + findIcon.toString();

    let declarationFile = "// This file was generated by vorfahrt/vienna at " + new Date().toISOString() + "\n\n";
    declarationFile += "declare module \"@koenidv/vorfahrt-vienna\";";
    declarationFile += "export const findIcon: " + findIconType + ";\n"
    declarationFile += "export type fileTypes = " + [...fileTypes].map(e => `"${e}"`).join(" | ") + " ;\n";
    declarationFile += "export type entityTags = " + [...entityTypes].map(e => `"${e}"`).join(" | ") + ";\n";

    return { indexFile, declarationFile };
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
    const candidates = exports.filter(el =>
        el.filetype === filetype &&
        entities.every(i => el.entities.map(eli => eli.toLowerCase()).includes(i.toLowerCase())));
    if (candidates.length === 0) {
        console.error("vorfahrt/vienna", "no candidates found for", filetype, entities)
        return;
    }
    // select the candidate with the least entities → highest % match
    const bestCandidate = candidates.reduce((prev, curr) => prev.entities.length < curr.entities.length ? prev : curr);
    return bestCandidate.symbolName;
}

const findIconType = "(filetype: fileTypes, entities: entityTags[]) => string | undefined"

