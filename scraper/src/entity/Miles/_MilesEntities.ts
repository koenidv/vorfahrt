import { City } from "./City";
import { VehicleDamage } from "./VehicleDamage";
import { VehicleLastKnown } from "./VehicleLastKnown";
import { VehicleMeta } from "./VehicleMeta";
import { VehicleModel } from "./VehicleModel";
import { VehicleSize } from "./VehicleSize";

export const MilesEntities = [
  City,
  VehicleDamage,
  VehicleMeta,
  VehicleModel,
  VehicleSize,
  VehicleLastKnown
];

export default {...MilesEntities}