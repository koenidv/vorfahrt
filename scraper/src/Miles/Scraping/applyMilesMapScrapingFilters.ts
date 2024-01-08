import MilesAreaSearch from "@koenidv/abfahrt/dist/src/miles/MilesAreaSearch";
import { MilesCityMeta } from "../Miles.types";
import { FUEL_FILTERS_5, FUEL_FILTERS_EACH, OVERRIDE_FUEL_FILTERS } from "./applyMilesScrapingFilters.config";
import { FETCHING_STRATEGY } from "@koenidv/abfahrt";

export function applyMilesMapScrapingFilters(city: MilesCityMeta, mapSearch: MilesAreaSearch, cycleTime: number) {
    applyDelay(mapSearch, cycleTime);
    const { singleFilter } = applyFuelFilters(city, mapSearch);
    applyStrategy(mapSearch, singleFilter);
}


function applyFuelFilters(city: MilesCityMeta, mapSearch: MilesAreaSearch): { singleFilter: boolean } {

    // todo possibly replace fuel filters with predictive subareas

    if (process.argv.includes("--use-old-fuel-filters")) {
        if (city.area.latitudeDelta > 0.2 || city.area.longitudeDelta > 0.2) mapSearch.setFuelFilters(FUEL_FILTERS_EACH);
        else mapSearch.setFuelFilters(FUEL_FILTERS_5);
        return { singleFilter: false };
    } else {
        if (OVERRIDE_FUEL_FILTERS.hasOwnProperty(city.idCity)) {
            mapSearch.setFuelFilters(OVERRIDE_FUEL_FILTERS[city.idCity]);
            return { singleFilter: OVERRIDE_FUEL_FILTERS[city.idCity].length === 1 };
        } else {
            mapSearch.setFuelFilters([{ minFuel: 0, maxFuel: 100 }]);
            return { singleFilter: true };
        }
    }
}

/**
 * Clusters are not affected by fuel filters, therefore only use them when a single fuel filter is applied
 * @param mapSearch Area search to apply strategy to
 * @param singleFilter wether a single fuel filter applied
 */
function applyStrategy(mapSearch: MilesAreaSearch, singleFilter: boolean) {
    if (singleFilter) {
        mapSearch.setFetchingStrategy(FETCHING_STRATEGY.QUADRANTS_WITH_CLUSTERS);
    } else {
        mapSearch.setFetchingStrategy(FETCHING_STRATEGY.QUADRANTS_WITH_VEHICLES);
    }
}

const TARGET_CITY_TIME = 1000 * 60 * 3;
const MIN_DELAY = 200;
const MAX_DELAY = 1000;

function applyDelay(mapSearch: MilesAreaSearch, cycleTime: number) {
    let maxEnqueued = 0;

    if (process.argv.includes("--use-dynamic-map-throttling")) {
        const delayFn = (enqueued: number) => {
            maxEnqueued = Math.max(maxEnqueued, enqueued);
            return Math.min(Math.max(TARGET_CITY_TIME / maxEnqueued, MIN_DELAY), MAX_DELAY);
        }
        mapSearch.setTaskDelay(delayFn);
        return;
    }

    mapSearch.setTaskDelay(cycleTime);
}