import { Point, WriteApi } from "@influxdata/influxdb-client"

export class RelationalStoreObserver {
  protected writeClient: WriteApi

  constructor(writeClient: WriteApi) {
    this.writeClient = writeClient
  }

  public onDbError(error: Error | object) {
    const logPoint = new Point("db_error")
      .tag("error", "name" in error ? error.name : "unknown")
      .stringField("message", "message" in error ? error.message : "unknown")
      .stringField("stack", "stack" in error ? error.stack : "unknown")
      .intField("time", new Date().getTime())
    this.writeClient.writePoint(logPoint)
  }
}
