import { VehicleSize } from "./enums";

export type Vehicle = {
    id: number;
    licensePlate: string;
    coordinates: Coordinate;
    model: string;
    isElectric: boolean;
    isPlugged: boolean;
    isDiscounted: boolean;
    charge: number;
    range: string;
    color: string;
    size: VehicleSize;
    image: string;
  };
  
  export type ChargeStation = {
    provider: "BERLIN_STADTWERKE" | "OTHER";
    coordinates: Coordinate;
    name: string;
    address: string;
    milesId: number;
  }
  
  export type Coordinate = {
    lat: number;
    lng: number;
  }