import { apiVehiclesResponse } from "./apiTypes";
import { VehicleSize } from "./enums";
import { ChargeStation, Vehicle } from "./types";

function parseChargePercentage(fuelPct: string): number {
  return parseInt(fuelPct.replace("%", ""));
}

export const parseVehicles = (response: apiVehiclesResponse): Vehicle[] => {
  const vehiclesOriginal = response.Data.vehicles;
  const vehicles: Vehicle[] = vehiclesOriginal.map((vehicle) => {
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
      charge: parseChargePercentage(vehicle.FuelPct),
      range: vehicle.RemainingRange,
      color: vehicle.VehicleColor,
      size: vehicle.VehicleSize as VehicleSize,
      image: vehicle.URLVehicleImage,
    };
  });
  return vehicles;
};

export const parseChargeStations = (
  response: apiVehiclesResponse,
): ChargeStation[] => {
  // todo
  return [] as ChargeStation[];
};
