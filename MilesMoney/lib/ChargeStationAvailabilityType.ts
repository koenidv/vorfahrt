import { Coordinate } from "./Miles/types";

export type ChargeStationAvailability = {
  provider: "BSW" | string;
  name: string;
  coordinates: Coordinate;
  statusKnown: boolean;
  available: number;
  total: number;
  connectors?: {
    id: string;
    uid: string;
    available: boolean;
    statusKnown: boolean;
  }[];
};
