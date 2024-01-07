const FUEL_FILTERS_1 = [{ minFuel: 0, maxFuel: 100 }];
const FUEL_FILTERS_2 = [{ minFuel: 0, maxFuel: 60 }, { minFuel: 61, maxFuel: 100 }];
const FUEL_FILTERS_3 = [{ minFuel: 0, maxFuel: 40 }, { minFuel: 41, maxFuel: 70 }, { minFuel: 71, maxFuel: 100 }];

export const FUEL_FILTERS_5 = [
    { minFuel: 0, maxFuel: 25 },
    { minFuel: 26, maxFuel: 46 },
    { minFuel: 47, maxFuel: 68 },
    { minFuel: 69, maxFuel: 88 },
    { minFuel: 89, maxFuel: 100 },
]

const largeFirstIntervalSize = 15;
const largeRemainingPercentages = Array.from({ length: 100 - largeFirstIntervalSize }, (_, idx) => idx + largeFirstIntervalSize + 1);
export const FUEL_FILTERS_EACH = [
    {
        minFuel: 0,
        maxFuel: largeFirstIntervalSize,
    },
    ...largeRemainingPercentages.map((percentage) => ({
        minFuel: percentage,
        maxFuel: percentage,
    })),
];

export const OVERRIDE_FUEL_FILTERS: { [key: string]: { minFuel: number, maxFuel: number }[] } = {
    BER: FUEL_FILTERS_1,
    HAM: FUEL_FILTERS_1,
    MUC: FUEL_FILTERS_1,
    STR: FUEL_FILTERS_1,
    CGN: FUEL_FILTERS_1,
    ANR: FUEL_FILTERS_1,
    DUS: FUEL_FILTERS_1,
    GNE: FUEL_FILTERS_1,
    ZOI: FUEL_FILTERS_1,
    BRU: FUEL_FILTERS_2,
    AGB: FUEL_FILTERS_2,
    UWP: FUEL_FILTERS_2,
    BNN: FUEL_FILTERS_3,
    DUI: FUEL_FILTERS_3,
    PTD: FUEL_FILTERS_5,
}
// some testing on the fuel filters: https://gist.github.com/koenidv/4e9a8cd26319eb1fae56a01bafe2a412

// todo Tiny area in CGN is manually removed, meaning it's not observed
// todo Airport areas should not be included in city areas but scraped separately
// todo STR is also hugely inefficient, but not yet sure why