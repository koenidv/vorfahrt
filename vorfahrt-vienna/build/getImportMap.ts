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
}