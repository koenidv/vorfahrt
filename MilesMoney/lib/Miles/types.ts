export enum VehicleSize {
  s = "S",
  m = "M",
  l = "L",
  xl = "XL",
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
  idCluster: number;
  idClusterHash: string;
  Latitude: number;
  Longitude: number;
  nUnits: number;
  Bounds: string;
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
    pois: unknown[];
    partners: unknown[];
  };
};
