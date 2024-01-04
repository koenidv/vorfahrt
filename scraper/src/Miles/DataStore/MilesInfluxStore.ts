import { WriteApi, Point, QueryApi } from "@influxdata/influxdb-client";
import { apiVehicleJsonParsed } from "@koenidv/abfahrt/dist/src/miles/apiTypes";
import { FieldComparison, InfluxVehicleComparison } from "./InfluxVehicleComparison";
import { VEHICLE_TRACKED_FIELDS } from "../InfluxVehicleComparison.config";

export class MilesInfluxStore {
    writeClient: WriteApi;
    queryClient: QueryApi;

    constructor(writeClient: WriteApi, queryClient: QueryApi) {
        this.writeClient = writeClient;
        this.queryClient = queryClient;
    }

    handleVehicle(vehicle: apiVehicleJsonParsed) {
        this.saveChangedVehicle(vehicle);
    }

    async saveChangedVehicle(newVehicle: apiVehicleJsonParsed) {
        const currentVehicle = await this.queryCurrentVehicle(newVehicle.idVehicle) as any;
        const basePoint = new Point("vehicle_data")
            .tag("vehicleId", newVehicle.idVehicle.toString())
            .tag("status", newVehicle.idVehicleStatus.toString())
            .tag("city", newVehicle.idCity.toString())

        const modifiedPoint =
            new InfluxVehicleComparison(currentVehicle, newVehicle, basePoint)
                .checkForStatusChange()
                .applyLocationChange()
                .applyChargingChange()
                .applyDiscountedChange()
                .applyDamageCountChange()
                .applyChanges(VEHICLE_TRACKED_FIELDS)
                .point

        if (Object.keys(modifiedPoint.fields).length !== 0)
            this.writeClient.writePoint(modifiedPoint);
    }


    // fixme this needs to be a lot more efficient on the db (batch query vehicles)
    async queryCurrentVehicle(vehicleId: number) {
        const rows = await this.queryClient.collectRows(`
            from(bucket: "miles")
            |> range(start: -6h)
            |> filter(fn: (r) => r.vehicleId == "${Number(vehicleId)}") 
            |> group(columns: ["_field"]) 
            |> last() 
            |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")`
        )
        if (rows.length === 0) return {};
        return rows[0];
    }



}