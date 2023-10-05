import { Region } from "react-native-maps";
import { Vehicle } from "./Miles/types";
import { unionBy } from "lodash";

export const mergeVehiclesForRegion = (currentVehicles: Vehicle[], newVehicles: Vehicle[], region: Region): Vehicle[] => {

    // todo vehicles should not be removed if the miles api vehicle count is maxed out, display a warning instead

    // remove vehicles in the current region
    // v.coordinates is { lat, lng } and region is { latitude, longitude, latitudeDelta, longitudeDelta }
    const vehicles = currentVehicles.filter((v) => {
        const remove = (
            v.coordinates.lat < region.latitude + region.latitudeDelta / 2 &&
            v.coordinates.lat > region.latitude - region.latitudeDelta / 2 &&
            v.coordinates.lng < region.longitude + region.longitudeDelta / 2 &&
            v.coordinates.lng > region.longitude - region.longitudeDelta / 2
        );
        return !remove;
    });

    return unionBy([
        ...vehicles,
        ...newVehicles,
    ]);

}