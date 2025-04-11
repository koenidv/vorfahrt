import { MilesVehicleStatus } from "@koenidv/abfahrt"
import { apiVehicleJsonParsed } from "@koenidv/abfahrt/dist/src/miles/apiTypes"
import { TripType } from "@vorfahrt/shared"

const publicStatuses = [
  MilesVehicleStatus.DEPLOYED_FOR_RENTAL,
  MilesVehicleStatus.USER_IN_RIDE,
  MilesVehicleStatus.PAUSED_BY_USER,
  MilesVehicleStatus.BOOKED_BY_USER,
] as string[]

export function determineTripType(vehicle: apiVehicleJsonParsed): TripType {
  if (vehicle.idVehicleStatus == MilesVehicleStatus.CAR_SUBSCRIPTION)
    return TripType.SUBSCRIPTION
  if (publicStatuses.includes(vehicle.idVehicleStatus)) return TripType.PUBLIC
  return TripType.RELOCATION
}
