import MilesAreaSearch from "@koenidv/abfahrt/dist/src/miles/MilesAreaSearch";
import { MilesCityAreaBounds, MilesCityMeta } from "../Miles.types";

export function applyMilesMapScrapingFilters(city: MilesCityMeta, mapSearch: MilesAreaSearch) {
    applyFuelFilters(city, mapSearch);
    applyDelay(mapSearch);
}


const largeFirstIntervalSize = 15;
const largeRemainingPercentages = Array(100 - largeFirstIntervalSize)
    .fill(null)
    .map((_, idx) => idx + largeFirstIntervalSize + 1);
export const largeFuelFilters = [
    {
        minFuel: 0,
        maxFuel: largeFirstIntervalSize,
    },
    ...largeRemainingPercentages.map((percentage) => ({
        minFuel: percentage,
        maxFuel: percentage,
    })),
];

const smallFuelFilters = [
    { minFuel: 0, maxFuel: 25 },
    { minFuel: 26, maxFuel: 46 },
    { minFuel: 47, maxFuel: 68 },
    { minFuel: 69, maxFuel: 88 },
    { minFuel: 89, maxFuel: 100 },
]

function applyFuelFilters(city: MilesCityMeta, mapSearch: MilesAreaSearch) {
    if (city.area.latitudeDelta > 0.2 || city.area.longitudeDelta > 0.2) {
        mapSearch.setFuelFilters(largeFuelFilters);
    } else {
        mapSearch.setFuelFilters(smallFuelFilters);
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