import { memo, useState } from "react";
import {Image} from "react-native";
import {Vehicle} from "../../lib/Miles/types";
import findIcon from "@koenidv/vorfahrt-vienna";
import {Marker} from "react-native-maps";

type VehicleMarkerProps = {
  onPress: (vehicle: Vehicle) => void;
  vehicle: Vehicle;
  isSelected: boolean;
};

function findIconForVehicle(vehicle: Vehicle, isSelected: boolean) {
  const tags: string[] = [];
  tags.push(vehicle.model);
  if (vehicle.isElectric) {
    switch (vehicle.charge) {
      case 35:
        tags.push("electric_plus5");
        break;
      case 34:
        tags.push("electric_plus4");
        break;
      case 33:
        tags.push("electric_plus3");
        break;
      case 32:
        tags.push("electric_plus2");
        break;
      case 31:
        tags.push("electric_plus1");
        break;
      default:
        tags.push("electric");
        break;
    }
  } else tags.push("fuel");
  if (vehicle.isPlugged) tags.push("charging");
  if (vehicle.isDiscounted) tags.push("discounted");
  if (isSelected) tags.push("selected");

  return findIcon("png", tags);
}

const VehicleMarker = (props: VehicleMarkerProps) => {
  const icon = findIconForVehicle(props.vehicle, props.isSelected);
  if (!icon) return null;

  const [imageLoading, setImageLoading] = useState(true);

  return (
    <Marker
      coordinate={{
        latitude: props.vehicle.coordinates.lat,
        longitude: props.vehicle.coordinates.lng,
      }}
      onPress={props.onPress.bind(this, props.vehicle)}
      key={"v_" + props.vehicle.id}
      tracksViewChanges={imageLoading || props.isSelected}>
      <Image
        onLoadEnd={() => setImageLoading(false)}
        source={icon}
        style={{position: "absolute", width: 40, height: 40}}
      />
    </Marker>
  );
};

export default memo(VehicleMarker);
