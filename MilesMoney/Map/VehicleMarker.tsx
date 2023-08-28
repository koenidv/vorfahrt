import {Vehicle} from "../lib/Miles/types";
import * as React from "react";
import Background from "../assets/icons/Marker/background.svg";

const VehicleMarker = /*(vehicle: Vehicle)*/() => {
  return <Background width={100} height={100} />;
};

export default VehicleMarker;
