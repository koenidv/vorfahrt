import { Point } from "@influxdata/influxdb-client";
import { apiVehicleJsonParsed } from "@koenidv/abfahrt/dist/src/miles/apiTypes";
import GeoPoint from "../utils/GeoPoint";

export enum FieldType {
    FLOAT, INT, BOOLEAN, STRING
}

export type FieldComparison = {
    fieldName: string,
    fieldType: FieldType,
    compareToKey: keyof apiVehicleJsonParsed,
}

export class InfluxVehicleComparison {
    private currentVehicle: object;
    private newVehicle: apiVehicleJsonParsed;
    private _point: Point;
    public get point(): Point {
        return this._point;
    }

    constructor(currentVehicle: object, newVehicle: apiVehicleJsonParsed, point: Point) {
        this.currentVehicle = currentVehicle;
        this.newVehicle = newVehicle;
        this._point = point;
    }

    applyLocationChange(): InfluxVehicleComparison {
        if (!this.currentVehicle["latitude"] || !this.currentVehicle["longitude"]) {
            this.applyLocationFields();
            return this;
        }
        const oldGeo = new GeoPoint(this.currentVehicle["latitude"], this.currentVehicle["longitude"])
        const newGeo = new GeoPoint(this.newVehicle.Latitude, this.newVehicle.Longitude)
        if (!newGeo.equalsWithTolerance(oldGeo)) {
            this.applyLocationFields();
        }
        return this;
    }

    private applyLocationFields() {
        this.applyField(this.newVehicle.Latitude, "latitude", FieldType.FLOAT);
        this.applyField(this.newVehicle.Longitude, "longitude", FieldType.FLOAT);
    }

    applyDiscountedChange(): InfluxVehicleComparison {
        const isDiscounted = this.newVehicle.RentalPrice_discounted_parsed !== null;
        this.applyChange(this.currentVehicle["discounted"], isDiscounted, "discounted", FieldType.BOOLEAN);
        return this;
    }

    applyDamageCountChange(): InfluxVehicleComparison {
        const newDamageCount = this.newVehicle.JSONVehicleDamages.length;
        this.applyChange(this.currentVehicle["damageCount"], newDamageCount, "damageCount", FieldType.INT);
        return this;
    }

    applyChanges(comparisons: FieldComparison[]): InfluxVehicleComparison {
        comparisons.forEach(this.applyComparison, this);
        return this;
    }

    private applyComparison(comparison: FieldComparison) {
        const newValue = this.newVehicle[comparison.compareToKey]
        const oldValue = this.currentVehicle[comparison.fieldName]
        this.applyChange(oldValue, newValue, comparison.fieldName, comparison.fieldType)
    }

    private applyChange(oldValue: unknown, newValue: unknown, fieldName: string, fieldType: FieldType) {
        if (oldValue === newValue) return;
        this.applyField(newValue, fieldName, fieldType)
    }

    private applyField(newValue: unknown, fieldName: string, fieldType: FieldType) {
        switch (fieldType) {
            case FieldType.FLOAT:
                this._point.floatField(fieldName, newValue)
                break;
            case FieldType.INT:
                this._point.intField(fieldName, newValue)
                break;
            case FieldType.BOOLEAN:
                this._point.booleanField(fieldName, newValue)
                break;
            case FieldType.STRING:
                this._point.stringField(fieldName, newValue)
                break;
        }
    }

}