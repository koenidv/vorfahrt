import { Point } from "typeorm";
import { createHash } from "node:crypto";

export function createPoint(coordinates: { lat: number; lng: number }) {
  return `(${coordinates.lng}, ${coordinates.lat})`;
}

export function insecureHash(...args: any[]) {
  return createHash("sha1").update(args.join(":")).digest("base64url");
}