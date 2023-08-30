import {Vehicle, apiVehicle} from "../lib/Miles/types";
import * as React from "react";
import {View} from "react-native";
import VehicleMarkerChargestate from "./VehicleMarkerChargestate";
import Background from "../assets/icons/Marker/background.svg";
import VehicleMarkerType from "./VehicleMarkerType";

type VehicleMarkerProps = {
  vehicle: apiVehicle;
};

const VehicleMarker = (props: VehicleMarkerProps) => {
  return (
    <View>
      <Background style={{position: "absolute"}} width={40} height={40} />
      <VehicleMarkerChargestate
        isElectric={props.vehicle.isElectric}
        chargeState={+props.vehicle.FuelPct.replace("%", "")}
      />
      <VehicleMarkerType type={props.vehicle.VehicleType} />
    </View>
  );
};

export default VehicleMarker;
