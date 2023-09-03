import AvailableUnknown from "../assets/icons/Marker/chargestation/unknown.svg";
import AvailableUnavailable from "../assets/icons/Marker/chargestation/unavailable.svg";
import Available1 from "../assets/icons/Marker/chargestation/available_1.svg";
import Available2 from "../assets/icons/Marker/chargestation/available_2.svg";
import Available3 from "../assets/icons/Marker/chargestation/available_3.svg";
import {ChargeStationAvailability} from "../lib/ChargeStationAvailabilityType";
import {ChargeStation} from "../lib/Miles/types";

export interface ChargeStationMarkerProps {
  station: ChargeStation & Partial<{availability: ChargeStationAvailability}>;
}

const ChargeStationMarker = (props: ChargeStationMarkerProps) => {
  const availability = props.station.availability;
  if (!availability || !availability.statusKnown) {
    return (
      <AvailableUnknown style={{position: "absolute"}} width={40} height={40} />
    );
  } else if (availability.available === 0) {
    return (
      <AvailableUnavailable
        style={{position: "absolute"}}
        width={40}
        height={40}
      />
    );
  } else if (availability.available === 1) {
    return <Available1 style={{position: "absolute"}} width={40} height={40} />;
  } else if (availability.available === 2) {
    return <Available2 style={{position: "absolute"}} width={40} height={40} />;
  } else {
    return <Available3 style={{position: "absolute"}} width={40} height={40} />;
  }
};

export default ChargeStationMarker;
