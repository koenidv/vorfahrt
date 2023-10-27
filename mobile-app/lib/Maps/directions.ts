import { LatLng } from "react-native-maps";
import { Coordinate } from "../Miles/types";
import { decode, encode } from "@googlemaps/polyline-codec";

export enum Travelmodes {
    DRIVING = "driving",
    WALKING = "walking",
    TRANSIT = "transit"
}

export type Route = {
    length_display: string;
    length: number;
    duration_display: string;
    duration: number;
    polyline: LatLng[];
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
        length_display: firstroute.legs[0].distance.text,
        length: firstroute.legs[0].distance.value,
        duration_display: firstroute.legs[0].duration.text,
        duration: firstroute.legs[0].duration.value,
        polyline: decode(firstroute.overview_polyline.points).map((c) => ({ latitude: c[0], longitude: c[1] }))
    }
}