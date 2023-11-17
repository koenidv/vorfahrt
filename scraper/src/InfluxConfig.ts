import { FieldComparison, FieldType } from "./Miles/DataStore/InfluxVehicleComparison";

export const VEHICLE_TRACKED_FIELDS: FieldComparison[] = [
    // location, discounted, damageCount are tracked separately
    {
        fieldName: "status",
        fieldType: FieldType.STRING,
        compareToKey: "idVehicleStatus"
    },
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