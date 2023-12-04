import { FieldComparison, FieldType } from "./DataStore/InfluxVehicleComparison";

export const VEHICLE_TRACKED_FIELDS: FieldComparison[] = [
    // location, discounted, damageCount, status, charging are tracked separately
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
        fieldName: "coverageGsm",
        fieldType: FieldType.INT,
        compareToKey: "GSMCoverage"
    },
    {
        fieldName: "coverageGps",
        fieldType: FieldType.INT,
        compareToKey: "SatelliteNumber"
    },s
]