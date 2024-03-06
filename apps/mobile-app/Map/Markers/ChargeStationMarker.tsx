import {Image} from "react-native";
import {ChargeStationAvailability} from "../../lib/ChargeStationAvailabilityType";
import { findIcon } from "@koenidv/vorfahrt-vienna";
import {memo, useState} from "react";
import {ChargeStation} from "../../lib/Miles/types";
import {Marker} from "react-native-maps";

type ChargeStationAndAvailability = ChargeStation &
  Partial<{availability: ChargeStationAvailability}>;

export interface ChargeStationMarkerProps {
  onPress: (station: ChargeStationAndAvailability | undefined) => void;
  station: ChargeStationAndAvailability | undefined;
  isSelected: boolean;
}

function findIconForStation(
  station: ChargeStationAndAvailability,
  isSelected: boolean,
) {
  const {availability} = station;
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

  return findIcon("png", iconTags);
}

const ChargeStationMarker = ({
  onPress,
  station,
  isSelected,
}: ChargeStationMarkerProps) => {
  const [imageLoading, setImageLoading] = useState(true);

  if (!station) return null;

  const icon = findIconForStation(station, isSelected);
  if (!icon) return null;

  return (
    <Marker
      key={"p_" + station.milesId}
      coordinate={{
        latitude: station.coordinates.lat,
        longitude: station.coordinates.lng,
      }}
      onPress={onPress.bind(this, station)}
      tracksViewChanges={imageLoading || isSelected}
      flat={true}
      anchor={{x: 0.5, y: 0.5}}
      calloutAnchor={{x: 0.45, y: 0.25}}>
      <Image
        onLoadEnd={setImageLoading.bind(this, false)}
        source={icon}
        style={{position: "absolute", width: 40, height: 40}}
      />
    </Marker>
  );
};

export default memo(ChargeStationMarker);
