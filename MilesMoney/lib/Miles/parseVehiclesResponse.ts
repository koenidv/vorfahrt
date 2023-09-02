import { Vehicle, apiVehiclesResponse } from "./types"

export const parseVehicles = (response: apiVehiclesResponse): Vehicle[] {
    const vehiclesOriginal = response.Data.vehicles;
    const vehicles = vehiclesOriginal.map((vehicle) => {
        return {
            id: vehicle.idVehicle,
            licensePlate: vehicle.LicensePlate,
            coordinates: {
            lat: vehicle.Latitude,
            lng: vehicle.Longitude,
            },
            type: vehicle.VehicleType,
            isElectric: vehicle.isElectric,
            isPlugged: vehicle.EVPlugged,
            isDiscounted: vehicle.RentalPrice_discounted !== "0",
            charge: vehicle.FuelPct,
            range: vehicle.RemainingRange,
            color: vehicle.VehicleColor,
            size: vehicle.VehicleSize,
            image: vehicle.URLVehicleImage,
        }
    })
}

export const parseChargeStations = (response: apiVehiclesResponse): ChargeStation[] {
    // todo
    return [] as ChargeStation[];
}