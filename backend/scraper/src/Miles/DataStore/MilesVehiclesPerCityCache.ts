import { apiVehicleJsonParsed } from "@koenidv/abfahrt/dist/src/miles/apiTypes";
import { MilesMapSource } from "../Scraping/MilesScraperMap";

type IdAndLocation = { id: number, lat: number, lon: number, charge: number };

export class MilesVehiclesPerCityCache {
    private cache = new Map<string, IdAndLocation[]>();

    constructor() { }

    /**
     * Saves current ids and returns a list of ids that were previously saved but are not in the new list
     * @param city Miles City ID to save and diff (e.g. "BER")
     * @param vehicles list of Miles Vehicle IDs
     */
    saveVehiclesDiffDisappeared(source: MilesMapSource, vehicles: apiVehicleJsonParsed[]): number[] {

        const previousInArea = this.cache.get(source.cityId)?.filter(this.cachedValueApplicable(source)) ?? [];
        const disappeared = previousInArea.filter(previous => !vehicles.some(vehicle => vehicle.idVehicle === previous.id));

        const newCache = this.cache.get(source.cityId)?.filter(
            previous => !disappeared.includes(previous) && !vehicles.some(v => previous.id === v.idVehicle)
        ) ?? [];
        newCache.push(...vehicles.map(vehicle => (
            { id: vehicle.idVehicle, lat: vehicle.Latitude, lon: vehicle.Longitude, charge: vehicle.FuelPct_parsed! }
        )));
        this.cache.set(source.cityId, newCache);

        return disappeared.map(el => el.id);
    }

    private cachedValueApplicable(filters: MilesMapSource): (cachedValue: IdAndLocation) => boolean {
        return (cachedValue: IdAndLocation) => {
            return (
                cachedValue.charge >= filters.chargeMin &&
                cachedValue.charge <= filters.chargeMax &&
                cachedValue.lat >= filters.area.latitude - filters.area.latitudeDelta / 2 &&
                cachedValue.lat <= filters.area.latitude + filters.area.latitudeDelta / 2 &&
                cachedValue.lon >= filters.area.longitude - filters.area.longitudeDelta / 2 &&
                cachedValue.lon <= filters.area.longitude + filters.area.longitudeDelta / 2
            )
        }
    }

}