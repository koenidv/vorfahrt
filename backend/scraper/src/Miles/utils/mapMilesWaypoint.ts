import { apiVehicleJsonParsed } from "@koenidv/abfahrt/dist/src/miles/apiTypes"
import { Trip, VehicleLastKnown } from "@vorfahrt/shared"
import { Waypoint } from "@vorfahrt/shared"

export async function mapMilesWaypoint(
  trip: Trip,
  vehicle: apiVehicleJsonParsed,
  getPostalCode: (lon: number, lat: number) => Promise<string | null>
): Promise<Waypoint> {
  const waypoint = new Waypoint()
  waypoint.trip = trip
  waypoint.setLocation(
    vehicle.Longitude,
    vehicle.Latitude,
    await getPostalCode(vehicle.Longitude, vehicle.Latitude)
  )
  waypoint.status = vehicle.idVehicleStatus.trim()
  waypoint.rangeRemaining = vehicle.RemainingRange_parsed!
  return waypoint
}

export async function mapLastKnownToMilesWaypoint(
  trip: Trip,
  lastKnown: VehicleLastKnown,
  getPostalCode: (lon: number, lat: number) => Promise<string | null>
): Promise<Waypoint> {
  const waypoint = new Waypoint()
  waypoint.trip = trip
  waypoint.setLocation(
    lastKnown.longitude,
    lastKnown.latitude,
    await getPostalCode(lastKnown.longitude, lastKnown.latitude)
  )
  waypoint.status = lastKnown.status
  waypoint.rangeRemaining = lastKnown.range
  return waypoint
}
