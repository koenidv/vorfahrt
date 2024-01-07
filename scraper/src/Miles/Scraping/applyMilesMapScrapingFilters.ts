import MilesAreaSearch from "@koenidv/abfahrt/dist/src/miles/MilesAreaSearch";
import { MilesCityAreaBounds, MilesCityMeta } from "../Miles.types";
import { FUEL_FILTERS_5, FUEL_FILTERS_EACH, OVERRIDE_FUEL_FILTERS } from "./applyMilesScrapingFilters.config";

export function applyMilesMapScrapingFilters(city: MilesCityMeta, mapSearch: MilesAreaSearch) {
    applyFuelFilters(city, mapSearch);
    applyDelay(mapSearch);
}




function applyFuelFilters(city: MilesCityMeta, mapSearch: MilesAreaSearch) {

    // todo as seen in abfahrt research, fuel filters are not effective. remove them, and possibly replace with predictive subareas
    // possibly consider doing percentages globally, without further subareas, additionally
    // todo when no fuel filter is applied (only 0-100), check quadrants for clusters, not vehicles

    if (process.argv.includes("--use-old-fuel-filters")) {
        if (city.area.latitudeDelta > 0.2 || city.area.longitudeDelta > 0.2) mapSearch.setFuelFilters(FUEL_FILTERS_EACH);
        else mapSearch.setFuelFilters(FUEL_FILTERS_5);
        return;
    }

    if (OVERRIDE_FUEL_FILTERS.hasOwnProperty(city.idCity)) {
        mapSearch.setFuelFilters(OVERRIDE_FUEL_FILTERS[city.idCity]);
    } else {
        mapSearch.setFuelFilters([{ minFuel: 0, maxFuel: 100 }]);
    }
}


const TARGET_CITY_TIME = 1000 * 60 * 3;
const MIN_DELAY = 1000 / 5;
const MAX_DELAY = 1000 / 1;

function applyDelay(mapSearch: MilesAreaSearch) {
    let maxEnqueued = 0;

    const delayFn = (enqueued: number) => {
        maxEnqueued = Math.max(maxEnqueued, enqueued);
        return Math.min(Math.max(TARGET_CITY_TIME / maxEnqueued, MIN_DELAY), MAX_DELAY);
    }

    mapSearch.setTaskDelay(delayFn);
}