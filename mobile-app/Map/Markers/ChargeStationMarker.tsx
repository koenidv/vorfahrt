import {Image, View} from "react-native";
import {ChargeStationAvailability} from "../../lib/ChargeStationAvailabilityType";
import findIcon from "@koenidv/vorfahrt-vienna";
import {memo} from "react";

export interface ChargeStationMarkerProps {
  availability: ChargeStationAvailability | undefined;
  isSelected: boolean;
}

const ChargeStationMarker = ({
  availability,
  isSelected,
}: ChargeStationMarkerProps) => {
  const iconTags = ["charger"];
  if (!availability || !availability.statusKnown) {
    iconTags.push("unknown");
  } else if (availability.available === 0) {
    iconTags.push("unavailable");
  } else if (availability.available === 1) {
    iconTags.push("1");
  } else if (availability.available === 2) {
    iconTags.push("2");
  } else {
    iconTags.push("more");
  }
  if (isSelected) iconTags.push("selected");

  const icon = findIcon("png", iconTags);
  if (!icon) return null;

  return (
    <View>
      <Image
        source={icon}
        style={{position: "absolute", width: 40, height: 40}}
      />
    </View>
  );
};

export default memo(ChargeStationMarker);
