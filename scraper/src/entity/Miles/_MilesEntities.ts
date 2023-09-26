import { City } from "./City";
import { CityToCityPricing } from "./CityToCityPricing";
import { CityToCityPricingHistory } from "./CityToCityPricingHistory";
import { NoParkingArea } from "./NoParkingArea";
import { NoParkingAreaHistory } from "./NoParkingAreaHistory";
import { Polygon } from "./Polygon";
import { Pricing } from "./Pricing";
import { PricingHistory } from "./PricingHistory";
import { ServiceArea } from "./ServiceArea";
import { ServiceAreaHistory } from "./ServiceAreaHistory";
import { Tariff } from "./Tariff";
import { TariffHistory } from "./TariffHistory";
import { VehicleChange } from "./VehicleChange";
import { VehicleCurrent } from "./VehicleCurrent";
import { VehicleDamage } from "./VehicleDamages";
import { VehicleMeta } from "./VehicleMeta";
import { VehicleModel } from "./VehicleModel";
import { VehicleSize } from "./VehicleSize";

export const MilesEntities = [
  City,
  CityToCityPricing,
  CityToCityPricingHistory,
  NoParkingArea,
  NoParkingAreaHistory,
  Polygon,
  Pricing,
  PricingHistory,
  ServiceArea,
  ServiceAreaHistory,
  Tariff,
  TariffHistory,
  VehicleChange,
  VehicleCurrent,
  VehicleDamage,
  VehicleMeta,
  VehicleModel,
  VehicleSize,
];

export default {...MilesEntities}