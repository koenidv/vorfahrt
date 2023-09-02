import {apiVehicle} from "../lib/Miles/apiTypes";
import * as React from "react";
import {View} from "react-native";
import Background from "../assets/icons/Marker/background.svg";
import VehicleMarkerChargestate from "./VehicleMarkerChargestate";
import VehicleMarkerType from "./VehicleMarkerType";
import ChargingSymbol from "../assets/icons/Marker/isCharging.svg";
import DiscountSymbol from "../assets/icons/Marker/isDiscounted.svg";

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
      {props.vehicle.EVPlugged && (
        <ChargingSymbol style={{position: "absolute"}} width={40} height={40} />
      )}
      {props.vehicle.RentalPrice_discounted && (
        <DiscountSymbol style={{position: "absolute"}} width={40} height={40} />
      )}
    </View>
  );
};

export default VehicleMarker;
