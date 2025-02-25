import { apiVehicleJsonParsed } from "@koenidv/abfahrt/dist/src/miles/apiTypes";
import { Trip, VehicleLastKnown } from "@vorfahrt/shared";
import { Waypoint } from "@vorfahrt/shared";

export function mapMilesWaypoint(trip: Trip, vehicle: apiVehicleJsonParsed): Waypoint {
  const waypoint = new Waypoint();
  waypoint.trip = trip;
  waypoint.setLocation(vehicle.Latitude, vehicle.Longitude);
  waypoint.status = vehicle.idVehicleStatus.trim();
  waypoint.rangeRemaining = vehicle.RemainingRange_parsed!;
  waypoint.plz = null // todo find PLZ
  return waypoint
}

export function mapLastKnownToMilesWaypoint(trip: Trip, lastKnown: VehicleLastKnown): Waypoint {
  const waypoint = new Waypoint();
  waypoint.trip = trip;
  waypoint.setLocation(lastKnown.latitude, lastKnown.longitude);
  waypoint.status = lastKnown.status;
  waypoint.rangeRemaining = lastKnown.range;
  waypoint.plz = null // todo find PLZ
  return waypoint
}