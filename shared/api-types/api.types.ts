import { MILES_STATUS_CODES } from "./api.enums";

export type VehicleType = [
    id: number,
    name: string,
    size: string,
    electric: boolean,
]

export type BasicVehicleStatus = [
    milesId: number,
    licensePlate: string,
    typeId: number,
    status: MILES_STATUS_CODES,
    latitude: number,
    longitude: number,
    timestamp: number,
    //images are per vehicle because of colors, but not worth it for now
]