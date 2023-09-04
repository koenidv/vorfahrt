export type WeRegion = {
  northEast: {
    lat: number;
    lng: number;
  };
  southWest: {
    lat: number;
    lng: number;
  };
};

export type WeChargeStation = {
  name: string;
  locationId: string; // eg "0888066c-1601-437d-b8b1-d03c7e259ec0"
  address: {
    zipcode: string;
    number: string;
    city: string;
    street: string;
    state: string;
    state_code: string;
    countryCode: string;
  },
  position: {
    lng: number;
    lat: number;
  },
  chargingPointOperator: {
    name: string;
    id: string; // eg "fa1d7058-dfce-4f27-a1cd-88a032b3114c"
  },
  isOpen24h: boolean;
  opState: "operational" | string;
  station: {
    currentType: "ac" | string;
    liveCountAvailableChargingPoints: number | undefined;
    totalCountChargingPoints: number;
  },
  distance: number;
  brand: string;
};