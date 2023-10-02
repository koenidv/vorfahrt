export enum ChangeEvent {
  "booked", // from status BOOKED_BY_USER
  "ride_started", // from status USER_IN_RIDE
  "ride_paused", // from status PAUSED_BY_USER
  "ride_resumed", // from status USER_IN_RIDE after PAUSED_BY_USER
  "ride_refueled", // from FuelPct = 100 & larger than before
  "ride_ended", // from status not anymore USER_IN_RIDE
  "charging_started", // from isCharging
  "charging_ended", // from not isCharging
  "undeployed", // from not isPublic(al)lyVisible
  "deployed", // from is Public(al)lyVisible
  "retired", // from status RETIRED
  "add", // previous vehicle not found
  "change", // other changes
}
