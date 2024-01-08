import { FETCHING_STRATEGY, JsonParseBehaviour, applyJsonParseBehaviourToVehicle } from "@koenidv/abfahrt";
import { apiVehicleJsonParsed } from "@koenidv/abfahrt/dist/src/miles/apiTypes";
import { BaseMilesScraperCycled } from "../BaseMilesScraper";
import { MilesCityMeta } from "../Miles.types";
import { RequestStatus, SOURCE_TYPE, ValueSource } from "../../types";

export interface PercentageSource extends ValueSource { source: SOURCE_TYPE.PERCENTAGE, value: number };

const DEBE_AREA: MilesCityMeta = {
    idCity: "internal-germany-belgium",
    name: "Internal (DE & BE)",
    location_lat: 50,
    location_long: 10,
    area: {
        latitude: 50,
        latitudeDelta: 10,
        longitude: 10,
        longitudeDelta: 10,
    }
}

export default class MilesScraperPercentages extends BaseMilesScraperCycled<apiVehicleJsonParsed, PercentageSource> {
    private minimumCharge: number = 2;
    private maximumCharge: number = 100;
    private percentages = Array.from({ length: this.maximumCharge - this.minimumCharge + 1 }, (_, i) => i + this.minimumCharge);
    private currentPercentageIndex: number = 0;

    async cycle(): Promise<{ data: apiVehicleJsonParsed[]; source: PercentageSource; } | null> {
        const percentage = this.selectNext()
        if (percentage !== null) {
            const results = await this.fetch(percentage);
            return results === null ? null : { data: results, source: { source: SOURCE_TYPE.PERCENTAGE, value: percentage } };
        }
        return null;
    }

    private selectNext(): number | null {
        if (this.percentages.length === 0) {
            this.logWarn("No percentage in queue: cycle will be skipped")
            return null;
        }
        this.currentPercentageIndex = (this.currentPercentageIndex + 1) % this.percentages.length;
        return this.percentages[this.currentPercentageIndex];
    }


    private async fetch(percentage: number): Promise<apiVehicleJsonParsed[] | null> {
        try {
            const results = await this.abfahrt
                .createVehicleSearch(DEBE_AREA.area)
                .setFetchingStrategy(FETCHING_STRATEGY.ONESHOT)
                .setFuelFilters([{ minFuel: percentage, maxFuel: percentage }])
                .execute();

            if (!results[0]?.data?.[0]?.Data) {
                this.observer.requestExecuted(RequestStatus.API_ERROR, results[0]?._time ?? 0, percentage)
                return null;
            }

            const vehicles = results[0]?.data?.[0]?.Data?.vehicles
            this.observer.requestExecuted(RequestStatus.OK, results[0]._time, percentage)
            return vehicles.map(v => applyJsonParseBehaviourToVehicle(v, JsonParseBehaviour.PARSE));
        } catch (e) {
            this.logError("Error occurred while scraping a percentage", e);
            this.observer.requestExecuted(RequestStatus.SCRAPER_ERROR, 0, percentage);
            return null;
        }
    }

}