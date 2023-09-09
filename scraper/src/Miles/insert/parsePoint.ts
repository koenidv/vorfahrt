import { Point } from "typeorm";

export function createPoint(coordinates: { lat: number; lng: number }) {
  return `(${coordinates.lng}, ${coordinates.lat})`;
}
