import { cityArea } from "@koenidv/abfahrt/dist/src/miles/apiTypes";
import { BaseMilesScraper } from "../BaseMilesScraper";
import { MilesCityAreaBounds } from "../Miles.types";
import { polygonToArea } from "@koenidv/abfahrt";

export default class MilesScraperCitiesMeta extends BaseMilesScraper<MilesCityAreaBounds> {
    lastResponseTime: number;
    lastCitiesCount: number;

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
        const timeNow = Date.now();
        const response = await this.abfahrt.getCityAreas({ cityAreasDate: lastWeek })
        this.lastResponseTime = Date.now() - timeNow;

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
        this.lastCitiesCount = bounds.length;
        return bounds;
    }

    popSystemStatus(): { [key: string]: number; } {
        const status = {
            lastResponseTime: this.lastResponseTime,
            lastCitiesCount: this.lastCitiesCount
        }
        this.lastResponseTime = undefined;
        this.lastCitiesCount = undefined;
        return status;
    }


}