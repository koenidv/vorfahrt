import { cityArea } from "@koenidv/abfahrt/dist/src/miles/apiTypes";
import { BaseMilesScraper } from "../BaseMilesScraper";
import { MilesCityAreaBounds } from "../Miles.types";
import { polygonToArea } from "@koenidv/abfahrt";

export default class MilesScraperCitiesMeta extends BaseMilesScraper<MilesCityAreaBounds> {
    // todo this also needs to parse JSONCities to get Name and Location

    async cycle(): Promise<{ data: MilesCityAreaBounds[] } | null> {
        const data = await this.fetch();
        return data === null ? null : { data };
    }

    async fetch(): Promise<MilesCityAreaBounds[]> {
        return this.citiesToMeta(await this.fetchCityPolygons());
    }

    private async fetchCityPolygons() {
        const today = new Date();
        const lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
        const response = await this.abfahrt.getCityAreas({ cityAreasDate: lastWeek })
        this.observer.requestExecuted(this, response.Result === "OK" ? "OK" : "API_ERROR", response._time);

        if (response.Result !== "OK") {
            this.logError("Error fetching city polygons:", response.Result);
            return null;
        }

        return JSON.parse(response.Data.JSONCityAreas).JSONCityAreas.areas as cityArea[];
    }

    private citiesToMeta(polgons: cityArea[]): MilesCityAreaBounds[] {
        const filtered = polgons.filter(polygon => polygon.idCityLayerType === "CITY_SERVICE_AREA");
        const bounds = filtered.map(polygon => ({
            cityId: polygon.idCity,
            area: polygonToArea(polygon)
        }));
        this.observer.measure(this, "cities", bounds.length)
        return bounds;
    }

}