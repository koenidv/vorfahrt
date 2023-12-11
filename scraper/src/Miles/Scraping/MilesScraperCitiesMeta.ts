import { cityArea } from "@koenidv/abfahrt/dist/src/miles/apiTypes";
import { BaseMilesScraper } from "../BaseMilesScraper";
import { MilesCityAreaBounds, MilesCityMeta } from "../Miles.types";
import { polygonToArea } from "@koenidv/abfahrt";
import { GetCityAreasResponse } from "@koenidv/abfahrt/dist/src/miles/net/getCityAreas";

export default class MilesScraperCitiesMeta extends BaseMilesScraper<MilesCityMeta> {

    async cycle(): Promise<{ data: MilesCityMeta[] } | null> {
        const data = await this.fetch();
        return data === null ? null : { data };
    }

    async fetch(): Promise<MilesCityMeta[] | null> {
        const data = await this.fetchUserHello();
        if (data === null) return null;

        const areas = this.parseCityPolygons(data);
        const info = this.parseCityInfo(data);

        const meta = info.map(city => {
            const area = areas.find(area => area.cityId === city.idCity);
            if (area === undefined) {
                this.logError("City", city.name, "has no area");
                return;
            }
            (city as MilesCityMeta).area = area.area;
            return city as MilesCityMeta;
        }).filter(city => city?.area !== undefined) as MilesCityMeta[];

        this.observer.measure("cities", meta.length)
        return meta;
    }

    async fetchUserHello() {
        const today = new Date();
        const lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
        const onRetry = (_: any, time: number) => this.observer.requestExecuted("API_ERROR", time);
        const response = await this.abfahrt.getCityAreas({ cityAreasDate: lastWeek, onRetry })
        this.observer.requestExecuted(response.Result === "OK" ? "OK" : "API_ERROR", response._time);

        if (response.Result !== "OK") {
            this.logError("Error fetching city polygons:", response.Result);
            return null;
        }

        return response.Data;
    }

    private parseCityPolygons(raw: GetCityAreasResponse["Data"]): MilesCityAreaBounds[] {
        const polygons = JSON.parse(raw.JSONCityAreas).JSONCityAreas.areas as cityArea[];
        const filtered = polygons.filter(polygon => polygon.idCityLayerType === "CITY_SERVICE_AREA");
        const bounds = filtered.map(polygon => ({
            cityId: polygon.idCity,
            area: polygonToArea(polygon)
        }));
        return bounds;
    }

    private parseCityInfo(raw: GetCityAreasResponse["Data"]): { idCity: string, name: string, location_lat: number, location_long: number }[] {
        const cities = JSON.parse(raw.JSONCites); // "JSONCites" is a type by Miles
        return cities;
    }

}