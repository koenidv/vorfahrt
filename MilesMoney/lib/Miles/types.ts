export enum VehicleSize {
  small = "S",
  medium = "M",
  large = "L",
  transporter = "XL",
  premium = "P",
}

export enum VehicleEngine {
  electric = "E",
  combustion = "C",
}

export enum VehicleSeats {
  three = "3",
  five = "5",
  nine = "9",
}

export enum VehicleType {
  //todo
}

export type Vehicle = {
  id: number;
  licensePlate: string;
  latitude: number;
  longitude: number;
  type: VehicleType;
  isElectric: boolean;
  isPlugged: boolean;
  isDiscounted: boolean;
  charge: number;
  range: string;
  color: string;
  size: VehicleSize;
  seats: VehicleSeats;
  price_km: string;
  price_park: string;
  price_unlock: string;
  image: string;
};

export type apiVehicle = {
  idVehicle: number;
  idCity: string;
  LicensePlate: string;
  VehicleType: string;
  VehicleColor: string;
  VehicleSize: string;
  isElectric: boolean;
  Latitude: number;
  Longitude: number;
  DistanceFromUserPosition: number;
  DistanceFromMiddlePosition: number;
  idVehicleStatus: string;
  GSMCoverage: number;
  SatelliteNumber: number;
  RentalPrice_row1: string;
  RentalPrice_row1unit: string;
  RentalPrice_discounted: string;
  RentalPrice_row2: string;
  RentalPrice_discountSource: string;
  ParkingPrice: string;
  ParkingPrice_discounted: string;
  ParkingPrice_unit: string;
  UnlockFee: string;
  UnlockFee_discounted: string;
  UnlockFee_unit: string;
  FuelPct: string;
  FuelLevelIcon: number;
  RemainingRange: string;
  EVPlugged: boolean;
  JSONFullVehicleDetails: string;
  FVDPrice: string;
  URLVehicleImage: string;
  JSONVehicleDamages: string;
  SpecialAirportRate: string;
  SpecialRates: string;
  ShowSpecialAirportRate: boolean;
  nDaysRookieDelay: number;
  CityToCityOptions: string;
  PremiumRestrictedTxt: string;
  RookieDelayTxt: string;
};

export type apiCluster = {
  idCluster: number | null;
  idClusterHash: string;
  Latitude: number;
  Longitude: number;
  nUnits: number;
  Bounds: string;
};

export type apiPOI = {
  idCityLayer: number;
  idCityLayerType: "EV_CHARGING_STATION" | "TOTAL_GAS_STATION" | "ARAL_GAS_STATION" | "GENERIC_GAS_STATION";
  Latitude: number;
  Longitude: number;
  Distance_m: number; // distance from user
  txtDistance: string; // rounded distance from user
  NavigateTo: null | string; // unsure
  Available: boolean;
  Station_Name: string;
  Station_Address: string;
};

export type apiPartner = {
  idMilesPartner: string;
  idMilesPartnerLocation: number;
  MapPointLogoURL: string;
  Lat: number;
  Long: number;
  ParkingArea: string;
  Info: string;
  distance_m: number;
};

export type apiVehiclesResponse = {
  Result: "OK" | string;
  ResponseText: null | string;
  Data: {
    response: {
      Result: "OK" | string;
      ResponseText: null | string;
      idVehicleBooked: null | number;
      idRide: null | number;
      idVehicleInRide: null | number;
      NearestIdCity: string;
      LivePayment: boolean;
      TopUpRequired: boolean;
      userAppVersion: number;
      nFilterElements: number;
      UserInOpsMode: boolean;
      CloseForceDisplayVehicle: boolean;
      SpecialAirportRate: null | string;
      SpecialAirportRate_E: null | string;
      SpecialAirportRate_2: null | string;
      SpecialAirportRate_E_2: null | string;
      UsesPPC: boolean;
      CurrentSubscription: null | string;
      JSONCityAreas: string;
      CityAreasTimestamp: string;
      AdditionalInfo: string;
    };
    vehicles: apiVehicle[];
    clusters: apiCluster[];
    pois: apiPOI[];
    partners: apiPartner[];
  };
};
