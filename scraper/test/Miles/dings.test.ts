//typeorm sache

import { mock } from "inatic";
import { VehicleChangeProps } from "../../src/Miles/insert/insertVehicleChange";

const data = mock<VehicleChangeProps>("not fucking charging");

console.log(data)
    