import {Vehicle} from "../lib/Miles/types";
import * as React from "react";
import { View } from "react-native";
import Background from "../assets/icons/Marker/background.svg";
import FullCharge from "../assets/icons/Marker/charge_30.svg";
import VW_ID3 from "../assets/icons/Marker/VW_ID3.svg";

const VehicleMarker = /*(vehicle: Vehicle)*/() => {
  return (
    <View>
      <Background style={{"position": "absolute"}} width={40} height={40} />
      <FullCharge style={{"position": "absolute"}} width={40} height={40} />
      <VW_ID3 style={{"position": "absolute"}} width={40} height={40} />
    </View>
  );
};

export default VehicleMarker;
