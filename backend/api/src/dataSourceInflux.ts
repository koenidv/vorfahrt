import { INFLUX_URL, INFLUX_TOKEN } from "./config";
import { InfluxDB, QueryApi } from "@influxdata/influxdb-client";

export function getInfluxQueryApi(): QueryApi {
  const influxdb = new InfluxDB({ url: INFLUX_URL, token: INFLUX_TOKEN, timeout: 60000 });
  return influxdb.getQueryApi("vorfahrt");
}
