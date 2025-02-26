import { Point, WriteApi } from "@influxdata/influxdb-client"
import { apiVehicleJsonParsed } from "@koenidv/abfahrt/dist/src/miles/apiTypes"
import { VehicleLastKnown } from "@vorfahrt/shared"

export class RelationalStoreObserver {
  private writeClient: WriteApi

  constructor(writeClient: WriteApi) {
    this.writeClient = writeClient
  }

  /**
   * Tracks the time since the last known vehicle status
   */
  public onVehicleDiffed(
    lastKnown: VehicleLastKnown,
    newVehicle: apiVehicleJsonParsed
  ) {
    const logPoint = new Point("vehicle_update")
      .tag("vehicleId", lastKnown.milesId.toString())
      .tag("status", newVehicle.idVehicleStatus)
      .intField(
        "secondsSinceUpdate",
        Math.round(new Date().getTime() - lastKnown.updated.getTime() / 1000)
      )
    this.writeClient.writePoint(logPoint)
  }

  /**
   * Tracks the current number of pending trips
   * This is not tracked when trups are finalized as the next trip start will update for the value
   */
  public onTripStarted(pendingTrips: number) {
    const logPoint = new Point("pending_trips").intField(
      "current_count",
      pendingTrips
    )
    this.writeClient.writePoint(logPoint)
  }
}
