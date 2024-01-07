const oneRequestFilters = [{ minFuel: 0, maxFuel: 100 }];
const twoRequestFilters = [{ minFuel: 0, maxFuel: 60 }, { minFuel: 61, maxFuel: 100 }];
const threeRequestFilters = [{ minFuel: 0, maxFuel: 40 }, { minFuel: 41, maxFuel: 70 }, { minFuel: 71, maxFuel: 100 }];

export const OVERRIDE_FUEL_FILTERS: { [key: string]: { minFuel: number, maxFuel: number }[] } = {
    ZOI: oneRequestFilters,
    GNE: oneRequestFilters,
    AGO: twoRequestFilters,
    UWP: twoRequestFilters,
    BNN: twoRequestFilters,
    DUI: threeRequestFilters,
}

// todo Tiny area in CGN is manually removed, meaning it's not observed
// todo Airport areas should not be included in city areas but scraped separately
// todo STR is also hugely inefficient, but not yet sure why