import { FieldComparison, FieldType } from "./Miles/DataStore/InfluxVehicleComparison";

export const VEHICLE_TRACKED_FIELDS: FieldComparison[] = [
    // location, discounted, damageCount, status are tracked separately
    {
        fieldName: "charge",
        fieldType: FieldType.INT,
        compareToKey: "FuelPct_parsed"
    },
    {
        fieldName: "range",
        fieldType: FieldType.INT,
        compareToKey: "RemainingRange_parsed"
    },
    {
        fieldName: "charging",
        fieldType: FieldType.BOOLEAN,
        compareToKey: "EVPlugged"
    },
    {
        fieldName: "coverageGsm",
        fieldType: FieldType.INT,
        compareToKey: "GSMCoverage"
    },
    {
        fieldName: "coverageGps",
        fieldType: FieldType.INT,
        compareToKey: "SatelliteNumber"
    },
    {
        fieldName: "city",
        fieldType: FieldType.STRING,
        compareToKey: "idCity"
    }
]

// fixme the single vehicle response does not inlcude EVPlugged - however, FullVehicleDetails includes this banner:
//     "vehicleBanner": [
//     {
//         "color": "#FFFFFF",
//         "text": "⚡Vehicle plugged",
//         "text2": "Please unplug before driving",
//         "delay": "5",
//         "clickAction": ""
//     }
// ],