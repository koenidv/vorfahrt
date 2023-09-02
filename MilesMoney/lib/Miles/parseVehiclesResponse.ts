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
      model: vehicle.VehicleType,
      isElectric: vehicle.isElectric,
      isPlugged: vehicle.EVPlugged,
      isDiscounted: vehicle.RentalPrice_discounted !== null,
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
  const pois = response.Data.pois;
  const chargeStations: ChargeStation[] = pois
    .filter((poi) => poi.idCityLayerType === "EV_CHARGING_STATION")
    .map((poi) => ({
      provider: "BERLIN_STADTWERKE",
      coordinates: {
        lat: poi.Latitude,
        lng: poi.Longitude,
      },
      name: poi.Station_Name,
      address: poi.Station_Address,
      milesId: poi.idCityLayer,
    }));
  return chargeStations;
};