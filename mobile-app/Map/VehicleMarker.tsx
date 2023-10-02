import * as React from "react";
import {View} from "react-native";
import Background from "../assets/icons/Marker/background.svg";
import VehicleMarkerChargestate from "./VehicleMarkerChargestate";
import VehicleMarkerType from "./VehicleMarkerType";
import ChargingSymbol from "../assets/icons/Marker/isCharging.svg";
import DiscountSymbol from "../assets/icons/Marker/isDiscounted.svg";
import {Vehicle} from "../lib/Miles/types";
import Id3 from "@koenidv/vorfahrt-vienna/dist/png/markers/VW ID.3_electric_plus1.png";

type VehicleMarkerProps = {
  vehicle: Vehicle;
};

const VehicleMarker = (props: VehicleMarkerProps) => {
  return (
    <View>
      <Background style={{position: "absolute"}} width={40} height={40} />
      <VehicleMarkerChargestate
        isElectric={props.vehicle.isElectric}
        chargeState={props.vehicle.charge}
      />
      <VehicleMarkerType type={props.vehicle.model} />
      {props.vehicle.isPlugged && (
        <ChargingSymbol style={{position: "absolute"}} width={40} height={40} />
      )}
      {props.vehicle.isDiscounted && (
        <DiscountSymbol style={{position: "absolute"}} width={40} height={40} />
      )}
      <img src={vehicleToImageFileName()} style={{position: "absolute"}} width={40} height={40} />
    </View>
  );
};

function vehicleToImageFileName(vehicle: Vehicle): string {
  const markers = 



  return ""
}

export default VehicleMarker;
