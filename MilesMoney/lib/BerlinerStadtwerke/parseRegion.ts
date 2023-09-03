import { Region } from "react-native-maps";
import { BswRegion } from "./types";

export const parseRegion = (region: Region): BswRegion => {
  const swlat = region.latitude - region.latitudeDelta / 2;
  const swlng = region.longitude - region.longitudeDelta / 2;
  const nelat = region.latitude + region.latitudeDelta / 2;
  const nelng = region.longitude + region.longitudeDelta / 2;
  return { swlat, swlng, nelat, nelng };
};
