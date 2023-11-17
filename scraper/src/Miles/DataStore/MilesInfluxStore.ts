import { WriteApi, Point } from "@influxdata/influxdb-client";
import { apiVehicleJsonParsed } from "@koenidv/abfahrt/dist/src/miles/apiTypes";


export class MilesInfluxStore {
    influxClient: WriteApi;

    constructor(influxClient: WriteApi) {
        this.influxClient = influxClient;
    }

    handleVehicle(vehicle: apiVehicleJsonParsed) {
        this.tempWriteVehicle(vehicle);
    } 

    async tempWriteVehicle(vehicle: apiVehicleJsonParsed) {
        //fixme location point should be renamed
        const location = new Point("location")
        .tag("vehicleId", vehicle.idVehicle.toString())
        .tag("licensePlate", vehicle.LicensePlate)
        .tag("model", vehicle.VehicleType)
        .tag("isCharity", vehicle.isCharity.toString())
        .tag("vehicleSize", vehicle.VehicleSize)
        .tag("state", vehicle.idVehicleStatus.toString())
        .floatField("latitude", vehicle.Latitude)
        .floatField("longitude", vehicle.Longitude)
        .intField("charge", vehicle.FuelPct_parsed)
        
        this.influxClient.writePoint(location);
    }

    
}