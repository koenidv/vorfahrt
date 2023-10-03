import { VALID_TYPESCRIPT_SYMBOL_REGEX } from "./options";
import { FileInfo } from "./types";

const getMarker = (type: FileInfo, chargingStates: FileInfo[]) => {

    const importStatements = chargingStates.map(i => `import ${i.fileNameWithoutExtension}_${type.fileNameWithoutExtension} from "../../dist/png/markers/${i.fileNameWithoutExtension}.${type.fileNameWithoutExtension}.png";`);

    const chargingStateVariants = `${type.fileNameWithoutExtension}: {
        chargingState: {
${chargingStates.map(i => {

        return `            "${i.fileNameWithoutExtension.replace(/(electric|fuel)_/g, "")}": ${i.fileNameWithoutExtension}_${type.fileNameWithoutExtension},`
    }).join("\n")}
        },
    },`

    return {
        importStatements,
        chargingStateVariants
    }
};

export const getVehicleMarkerImportMap = (types: FileInfo[], chargeStates: FileInfo[]) => {

    const markerInfos = types.map(i => getMarker(i, chargeStates));

    const importMapContents = `${markerInfos.map(i => i.importStatements.join("\n")).join("\n")}
    
const VehicleMarker = {
${markerInfos.map(i => "    " + i.chargingStateVariants).join("\n")}
};

export default VehicleMarker;`;

    return importMapContents
};

export type ImportMapItem = {
    objPath: string[],
    importPath: string,
    symbolName: string,
}
export type ImportMap = { [key: string]: string | ImportMap };

export const getTypescriptImportMap = (defaultExportName: string, items: ImportMapItem[]) => {

    const importStatementsStr = items.map(i => `import ${i.symbolName} from "${i.importPath}";`).join("\n");

    const itemsObj = getImportMap(items);

    const itemsStr = getTypescriptObjStr(itemsObj);

    const defaultExportStr = `const ${defaultExportName} = {\n${itemsStr}\n};\nexport default ${defaultExportName};`;

    const typescriptStr = `${importStatementsStr}\n\n${defaultExportStr}`;

    return typescriptStr;
}

const getImportMap = (items: ImportMapItem[]): ImportMap => {
    const result: { [key: string]: ImportMap } = {};

    const addItem = (obj: string | ImportMap, objPath: string[], symbolName: string) => {

        const [current, ...rest] = objPath;

        if (!current) {
            return;
        }

        if (!rest.length) {
            obj[current] = symbolName;
            return;
        }

        if (!obj[current]) {
            obj[current] = {};
        }

        addItem(obj[current], rest, symbolName);
    };

    for (const item of items) {
        addItem(result, item.objPath, item.symbolName);
    }
    return result;
};

const getTypescriptObjStr = (obj: ImportMap, parentPath = '  '): string => {
    let str = '';

    for (const [key, value] of Object.entries(obj)) {

        const keyStr = `\n${parentPath}"${key}": `;

        if (typeof value === "string") {
            if (!VALID_TYPESCRIPT_SYMBOL_REGEX.test(value)) {
                console.error(`ERROR: failed to generate spritemap because value is not a valid typescript symbol (may only contain numbers, letters, and underscores, and may not start with a number): "${value}"`);

                throw new Error("INVALID_TYPESCRIPT_SYMBOL");
            }
            str += keyStr + value + ","
        } else {
            str += keyStr + `{\n${getTypescriptObjStr(value, parentPath + "  ")}\n${parentPath}},`;
        }
    }
    return str;
};