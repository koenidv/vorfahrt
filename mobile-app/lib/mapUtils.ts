import { Share } from "react-native";
import { Coordinate } from "./Miles/types";

export function shareLocation(location: Coordinate) {
    const shareOptions = {
        title: 'Sharing a location',
        message: 'Move here',
        url: `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`,
        subject: 'Sharing a location'
    };
    Share.share(shareOptions);
}