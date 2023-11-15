import {useCallback} from "react";
import {ChargeStationAvailability} from "../lib/ChargeStationAvailabilityType";
import findIcon from "@koenidv/vorfahrt-vienna";
import {Vehicle} from "../lib/Miles/types";

export const getChargeStationIcon = (
  availability: ChargeStationAvailability | undefined,
  isSelected: boolean,
) => {
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
};

export const getVehicleIcon = (vehicle: Vehicle, isSelected: boolean) => {
  const tags = [vehicle.model];
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
};
