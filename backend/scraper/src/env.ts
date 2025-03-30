import { config } from "dotenv"
import GeoPoint from "./GeoPoint"

config({ path: ".env", override: false })

const assertString = (value: unknown, key: string) => {
  if (typeof value !== "string" || value.length < 1) {
    throw new Error(`${key} missing from env`)
  }
  return value
}

const assertPoint = (value: unknown, key: string) => {
  // should be GeoPoint

  if (typeof value !== "string" || value.length < 1) {
    throw new Error(`${key} missing from env`)
  }

  try {
    return GeoPoint.fromString(value)
  } catch (e) {
    throw new Error(
      `${key} is not a GeoPoint: ${value} does not conform to (long,lat)`
    )
  }
}

const env = {
  hostname: assertString(process.env.HOSTNAME, "HOSTNAME"),
  dbHost: assertString(process.env.DB_HOST, "DB_HOST"),
  dbPort: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
  dbUser: assertString(process.env.DB_USER, "DB_USER"),
  dbPassword: assertString(process.env.DB_PASSWORD, "DB_PASSWORD"),
  dbName: assertString(process.env.DB_NAME, "DB_NAME"),
  influxUrl: assertString(process.env.INFLUX_URL, "INFLUX_URL"),
  influxToken: assertString(process.env.INFLUX_TOKEN, "INFLUX_TOKEN"),
  rpm_map: process.env.RPM_MAP ? parseInt(process.env.RPM_MAP) : 120,
  rpm_vehicle: process.env.RPM_VEHICLE ? parseInt(process.env.RPM_VEHICLE) : 60,
  rpm_cities: process.env.RPM_CITIES
    ? parseInt(process.env.RPM_CITIES)
    : 1 / (60 * 12),
  scrape_single_city_id: process.env.SCRAPE_SINGLE_CITY_ID
    ? String(process.env.SCRAPE_SINGLE_CITY_ID)
    : null,
  tomtom_api_key: assertString(process.env.TOMTOM_API_KEY, "TOMTOM_API_KEY"),
  mpc_traffic_flow: process.env.TRAFFIC_FLOW_MINS
    ? parseInt(process.env.TRAFFIC_FLOW_MINS)
    : 5,
  traffic_area_northwest: assertPoint(
    process.env.TRAFFIC_AREA_NORTHWEST,
    "TRAFFIC_AREA_NORTHWEST"
  ),
  traffic_area_southeast: assertPoint(
    process.env.TRAFFIC_AREA_SOUTHEAST,
    "TRAFFIC_AREA_SOUTHEAST"
  ),
  traffic_flow_zoom: process.env.TRAFFIC_FLOW_ZOOM ? parseInt(process.env.TRAFFIC_FLOW_ZOOM) : 13,
  
} as const

export default env
