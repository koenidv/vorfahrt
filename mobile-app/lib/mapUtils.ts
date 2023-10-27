import { Linking, Share } from "react-native";
import { Coordinate } from "./Miles/types";
import { Travelmodes } from "./Maps/directions";

export function shareLocation(location: Coordinate, title?: string) {
    const shareOptions = {
        title: title || "From MilesMoney",
        message: `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`,
    };
    Share.share(shareOptions);
}

export function startNavigation(location: Coordinate, travelmode: Travelmodes, directStart: boolean = true) {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}&travelmode=${travelmode}${directStart ? "&dir_action=navigate" : ""}`;
    console.log(url)
    Linking.openURL(url);
}

export function openMilesApp() {
    Linking.openURL("https://api.app.miles-mobility.com/mobile/Screen/MapScreen")
}