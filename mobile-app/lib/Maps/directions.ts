import { LatLng } from "react-native-maps";
import { Coordinate } from "../Miles/types";
import { decode, encode } from "@googlemaps/polyline-codec";

export enum Travelmodes {
    DRIVING = "driving",
    WALKING = "walking",
    TRANSIT = "transit"
}

export type Route = {
    distance_display: string;
    distance: number;
    duration_display: string;
    duration: number;
    polyline: LatLng[];
}

export function shouldDisplayWalkingRoute(origin: Coordinate, destination: Coordinate) {
    // estimated distance if the earth was flat
    const distance = Math.sqrt(Math.pow(origin.lat - destination.lat, 2) + Math.pow(origin.lng - destination.lng, 2)) * 111000;
    return distance < 2000;

}

export async function getDirections(origin: Coordinate, destination: Coordinate, travelmode: Travelmodes): Promise<Route|null> {
    // fixme use env and roll keya
    const res = await fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&mode=${travelmode}&key=AIzaSyCgn2vFW5B5EQckP9TLNMar5CW5-DuL6BQ`);
    
    if (res.status !== 200) {
        return null;
    }

    const json = await res.json();
    const firstroute = json.routes[0];
    if (!firstroute) {
        return null;
    }

    return {
        distance_display: firstroute.legs[0].distance.text,
        distance: firstroute.legs[0].distance.value,
        duration_display: firstroute.legs[0].duration.text,
        duration: firstroute.legs[0].duration.value,
        polyline: decode(firstroute.overview_polyline.points).map((c) => ({ latitude: c[0], longitude: c[1] }))
    }
}