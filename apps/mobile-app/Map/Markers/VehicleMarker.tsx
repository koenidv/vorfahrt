"strict";

import {memo, useState} from "react";
import {Image, ImageProps} from "react-native";
import {Vehicle} from "../../lib/Miles/types";
import {findIcon, entityTags} from "@koenidv/vorfahrt-vienna";
import {Marker} from "react-native-maps";

type VehicleMarkerProps = {
  onPress: (vehicle: Vehicle) => void;
  vehicle: Vehicle;
  isSelected: boolean;
};

function findIconForVehicle(vehicle: Vehicle, isSelected: boolean) {
  const tags: entityTags[] = [];
  tags.push(vehicle.model as entityTags);
  if (vehicle.isElectric) tags.push("electric");
  else tags.push("fuel");
  switch (vehicle.charge - 30) {
    case 1:
      tags.push("plus1");
      break;
    case 2:
      tags.push("plus2");
      break;
    case 3:
      tags.push("plus3");
      break;
    case 4:
      tags.push("plus4");
      break;
    case 5:
      tags.push("plus5");
      break;
    case 6:
      tags.push("plus6");
      break;
    case 7:
      tags.push("plus7");
      break;
    case 8:
      tags.push("plus8");
      break;
    case 9:
      tags.push("plus9");
      break;
  }
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
      anchor={{x: 0.5, y: 0.85}}
      tracksViewChanges={imageLoading || props.isSelected}>
      <Image
        onLoadEnd={() => setImageLoading(false)}
        source={icon as unknown as ImageProps}
        style={{position: "absolute", width: 45, height: 45}}
      />
    </Marker>
  );
};

export default memo(VehicleMarker);
