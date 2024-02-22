export type BswRegion = {
  swlat: number;
  swlng: number;
  nelat: number;
  nelng: number;
};

export type BswChargeStation = {
  id: string;
  coordinates: {
    latitude: string;
    longitude: string;
  };
  status: "active" | "inactive";
  distance_in_m: string; // seems to be always "0"
  opening_times: {
    twentyfourseven: boolean;
    // what if not 24/7?
  };
  roaming: boolean;
  operatorId: string; // eg "BSW"
  evses: {
    uid: string; // eg "3307682"
    connectors: {
      id: string; // eg "254988312"
      standard: string; // eg "IEC_62196_T2"
      power_type: string; // eg "AC_3_PHASE"
      max_power: number; // eg 11
      status: "AVAILABLE" | "CHARGING" | "OUTOFORDER" | "BLOCKED" | "UNKNOWN";
    }[];
    reservable: boolean;
    roaming: boolean;
    id: string; // eg "DE*BSW*E603030*030"
  }[];
  tariffZones: unknown[]; // ?
};