import {Vehicle, apiVehicle} from "../lib/Miles/types";
import * as React from "react";
import {View} from "react-native";
import VehicleMarkerChargestate from "./VehicleMarkerChargestate";
import Background from "../assets/icons/Marker/background.svg";
import FullCharge from "../assets/icons/Marker/charge_30.svg";
import VW_ID3 from "../assets/icons/Marker/VW_ID3.svg";
import CUPRA from "../assets/icons/Marker/CUPRA.svg";

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
      {getVehicleComponent(props.vehicle.VehicleType)}
    </View>
  );
};

function getVehicleComponent(type: string) {
  if (type === "Cupra Born") {
    return <CUPRA style={{position: "absolute"}} width={40} height={40} />;
  } else {
    return <VW_ID3 style={{position: "absolute"}} width={40} height={40} />;
  }
}

export default VehicleMarker;
