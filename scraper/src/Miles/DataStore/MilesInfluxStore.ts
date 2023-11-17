import { WriteApi, Point, QueryApi } from "@influxdata/influxdb-client";
import { apiVehicleJsonParsed } from "@koenidv/abfahrt/dist/src/miles/apiTypes";
import { FieldComparison, InfluxVehicleComparison } from "./InfluxVehicleComparison";
import { VEHICLE_TRACKED_FIELDS } from "../../InfluxConfig";

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
        const basePoint = new Point("vehicle")
            .tag("vehicleId", newVehicle.idVehicle.toString())

        const modifiedPoint =
            new InfluxVehicleComparison(currentVehicle, newVehicle, basePoint)
                .applyLocationChange()
                .applyDiscountedChange()
                .applyDamageCountChange()
                .applyChanges(VEHICLE_TRACKED_FIELDS)
                .point

        this.writeClient.writePoint(modifiedPoint);
    }


    async queryCurrentVehicle(vehicleId: number) {
        const rows = await this.queryClient.collectRows(`
            from(bucket: "miles")
            |> range(start: -12h)
            |> filter(fn: (r) => r.vehicleId == ${Number(vehicleId)}) 
            |> group(columns: ["_field"]) 
            |> last() 
            |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")`
        )
        if (rows.length === 0) return {};
        return rows[0];
    }



}