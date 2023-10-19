import * as React from "react";
import {Image, View} from "react-native";
import {Vehicle} from "../../lib/Miles/types";
import findIcon from "@koenidv/vorfahrt-vienna";

type VehicleMarkerProps = {
  vehicle: Vehicle;
};

const VehicleMarker = (props: VehicleMarkerProps) => {
  const tags = [];
  tags.push(props.vehicle.model)
  if (props.vehicle.isElectric) {
    switch (props.vehicle.charge) {
      case 35: tags.push("electric_plus5"); break;
      case 34: tags.push("electric_plus4"); break;
      case 33: tags.push("electric_plus3"); break;
      case 32: tags.push("electric_plus2"); break;
      case 31: tags.push("electric_plus1"); break;
      default: tags.push("electric"); break;
    }
  } else tags.push("fuel");
  if (props.vehicle.isPlugged) tags.push("charging");
  if (props.vehicle.isDiscounted) tags.push("discounted");

  const icon = findIcon("png", tags);

  return (
    <View>
      <Image source={icon} style={{position: "absolute", width: 40, height: 40}} />
    </View>
  );
};

export default VehicleMarker;
