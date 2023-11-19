import { Area } from "@koenidv/abfahrt/dist/src/miles/tools/areas";

export type MilesCityMeta = {
    idCity: string;
    name: string;
    location_lat: number;
    location_long: number;
}

export type MilesCityAreaBounds = {
    cityId: string;
    area: Area;
}

export type MilesVehicleDetails = {
    value: string;
    key: string;
    item: string;
}[]