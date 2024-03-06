import { Region } from "react-native-maps";
import { WeRegion } from "./types";

export const parseRegion = (region: Region): WeRegion => {
  const swlat = region.latitude - region.latitudeDelta / 2;
  const swlng = region.longitude - region.longitudeDelta / 2;
  const nelat = region.latitude + region.latitudeDelta / 2;
  const nelng = region.longitude + region.longitudeDelta / 2;
  return {
    southWest: { lat: swlat, lng: swlng },
    northEast: { lat: nelat, lng: nelng },
  };
};
