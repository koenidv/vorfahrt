import { apiVehicleJsonParsed } from "@koenidv/abfahrt/dist/src/miles/apiTypes";
import { BaseMilesScraperCycled } from "../BaseMilesScraper";
import { MilesCityMeta } from "../Miles.types";
import { GetVehiclesResponse } from "@koenidv/abfahrt/dist/src/miles/net/getVehicles";
import { JsonParseBehaviour, applyJsonParseBehaviourToVehicle, areasToKML } from "@koenidv/abfahrt";
import { Point } from "@influxdata/influxdb-client";
import { FetchResult } from "@koenidv/abfahrt/dist/src/miles/MilesAreaSearch";
import { applyMilesMapScrapingFilters } from "./applyMilesMapScrapingFilters";
import { Area } from "@koenidv/abfahrt/dist/src/miles/tools/areas";

export type MapFiltersSource = { source: "map", cityId: string, area: Area, chargeMin: number, chargeMax: number };

// todo use target city scraping duration (or request RPM) instead of city RPM for speed control, just scrape one city after another

export default class MilesScraperMap extends BaseMilesScraperCycled<apiVehicleJsonParsed, MapFiltersSource> {
    private cities: MilesCityMeta[] = [];
    private _cycles = 0;

    async setAreas(cities: MilesCityMeta[]) {
        if (cities.toString() !== this.cities.toString()) {
            this.cities = cities
            this.observer.measure("cities", this.cities.length);
        }
    }

    async cycle(): Promise<null> {
        const next = this.selectNextCity();
        if (next === null) return null;
        const vehicles = await this.fetch(next);
        return null;
    }

    selectNextCity(): MilesCityMeta | null {
        if (this.cities.length === 0) {
            this.logWarn("No cities in queue: cycle will be skipped")
            return null;
        }
        return this.cities[this._cycles % this.cities.length];
    }

    async fetch(city: MilesCityMeta): Promise<void> {
        this._cycles++;
        const responseTimes: number[] = [];
        const responseTypes: ("OK" | "API_ERROR")[] = [];
        const vehicles: apiVehicleJsonParsed[] = [];

        const handleFetchResult = (result: FetchResult) => {
            const {
                vehicles: thisVehicles,
                responseTypes: thisResponseTypes
            } = this.handleFetchResult(result, city.idCity);
            vehicles.push(...thisVehicles);
            responseTimes.push(result._time);
            responseTypes.push(...thisResponseTypes);
        }

        const request = this.abfahrt.createVehicleSearch(city.area)
            .setMaxConcurrent(10)
        applyMilesMapScrapingFilters(city, request);

        request.addEventListener("fetchCompleted", handleFetchResult);
        request.addEventListener("fetchRetry", (_: any, time: number) => this.observer.requestExecuted("API_ERROR", time, city.idCity));

        const results = await request.execute();

        this.observer.measure("vehicles", vehicles.length, city.idCity);
        this.createLogPoint(city.idCity, vehicles, results.length, responseTimes, responseTypes);
    }

    handleFetchResult(result: FetchResult, cityId: string): { vehicles: apiVehicleJsonParsed[], responseTypes: ("OK" | "API_ERROR")[] } {
        const mapped = this.mapVehicleResponses(result.data);
        if (!result.filters.location) this.logWarn("No location filter in fetch result");

        this.observer.requestExecuted("OK", result._time, cityId); // todo "OK" status isn't checked
        this.listeners.forEach(listener => listener(mapped.vehicles, {
            source: "map",
            cityId,
            area: result.filters.location!,
            chargeMin: result.filters.fuel.minFuel,
            chargeMax: result.filters.fuel.maxFuel
        }));
        return { vehicles: mapped.vehicles, responseTypes: mapped.responseTypes };
    }

    mapFetchResults(results: FetchResult[]): { vehicles: apiVehicleJsonParsed[], responseTimes: number[], responseTypes: ("OK" | "API_ERROR")[] } {
        const responseTimes: number[] = [];
        const responseTypes: ("OK" | "API_ERROR")[] = [];
        const vehicles = results.flatMap(result => {
            responseTimes.push(result.resDate.getTime() - result.reqDate.getTime());
            const mapped = this.mapVehicleResponses(result.data);
            responseTypes.push(...mapped.responseTypes);
            return mapped.vehicles;
        })

        return { vehicles, responseTimes, responseTypes };
    }

    mapVehicleResponses(response: GetVehiclesResponse[]): { vehicles: apiVehicleJsonParsed[], responseTypes: ("OK" | "API_ERROR")[] } {
        const responseTypes: ("OK" | "API_ERROR")[] = [];

        const vehicles = response.flatMap(result => {
            responseTypes.push(result.Result === "OK" ? "OK" : "API_ERROR")
            return result.Data.vehicles.map(
                vehicle => applyJsonParseBehaviourToVehicle(vehicle, JsonParseBehaviour.PARSE));
        });

        return { vehicles, responseTypes };
    }

    createLogPoint(cityId: string, vehicles: apiVehicleJsonParsed[], requestCount: number, responseTimes: number[], responseTypes: ("OK" | "API_ERROR")[]) {
        const averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        const responseTypesCount = responseTypes.reduce((acc, cur) => {
            acc[cur] = (acc[cur] ?? 0) + 1;
            return acc;
        }, {} as { [key: string]: number });

        const point = new Point(`${this.scraperId}-citylog`)
            .tag("serviceId", this.scraperId)
            .tag("city", cityId)
            .intField("vehicles", [...new Set(vehicles.map(vehicle => vehicle.idVehicle))].length)
            .intField("occurences", vehicles.length)
            .intField("requests", requestCount)
            .intField("averageResponseTime", averageResponseTime || 0)
            .intField("OK", responseTypesCount["OK"] || 0)
            .intField("API_ERROR", responseTypesCount["API_ERROR"] || 0)

        this.observer.savePoint(point);
    }

    generateAreasKML(): string {
        return areasToKML(`Scraped areas at ${Date.now().toLocaleString}`, this.cities.map(city => ({ ...city.area, name: city.idCity })));
    }

}