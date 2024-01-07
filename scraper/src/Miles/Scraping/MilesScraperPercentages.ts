import { JsonParseBehaviour, applyJsonParseBehaviourToVehicle } from "@koenidv/abfahrt";
import { apiVehicleJsonParsed } from "@koenidv/abfahrt/dist/src/miles/apiTypes";
import { BaseMilesScraperCycled } from "../BaseMilesScraper";

type PercentageSource = { source: "percentage", value: number };

export default class MilesScraperVehicles extends BaseMilesScraperCycled<apiVehicleJsonParsed, PercentageSource> {
    private minimumCharge: number = 2;
    private maximumCharge: number = 100;
    private percentages = Array.from({ length: this.maximumCharge - this.minimumCharge + 1 }, (_, i) => i + this.minimumCharge);
    private currentPercentageIndex: number = 0;

    async cycle(): Promise<{ data: apiVehicleJsonParsed[]; source: PercentageSource; } | null> {
        const percentage = this.selectNext()
        if (percentage !== null) {
            const results = await this.fetch(percentage);
            return results === null ? null : { data: results, source: { source: "percentage", value: percentage } };
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
            // todo implement
            return null;
        } catch (e) {
            this.logError("Error occurred while scraping a percentage", e);
            this.observer.requestExecuted("SCRAPER_ERROR", 0, percentage);
            return null;
        }
    }

}