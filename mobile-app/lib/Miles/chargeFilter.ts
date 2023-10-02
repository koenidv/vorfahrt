import { VehicleEngine } from "./enums";

export const chargeFilter = (engineType: VehicleEngine, overflow: number = 0) =>
    engineType === VehicleEngine.electric ? 30 + overflow : 25; 