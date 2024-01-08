import { apiVehicleJsonParsed } from "@koenidv/abfahrt/dist/src/miles/apiTypes";
import { BaseMilesScraper } from "../BaseMilesScraper";
import { MilesCityMeta } from "../Miles.types";
import { GetVehiclesResponse } from "@koenidv/abfahrt/dist/src/miles/net/getVehicles";
import { JsonParseBehaviour, applyJsonParseBehaviourToVehicle, areasToKML } from "@koenidv/abfahrt";
import { Point } from "@influxdata/influxdb-client";
import { FetchResult } from "@koenidv/abfahrt/dist/src/miles/MilesAreaSearch";
import { applyMilesMapScrapingFilters } from "./applyMilesMapScrapingFilters";
import { Area } from "@koenidv/abfahrt/dist/src/miles/tools/areas";
import { RequestStatus } from "../../types";

export type MapFiltersSource = { source: "map", cityId: string, area: Area, chargeMin: number, chargeMax: number };

// todo use target city scraping duration (or request RPM) instead of city RPM for speed control, just scrape one city after another

export default class MilesScraperMap extends BaseMilesScraper<apiVehicleJsonParsed, MapFiltersSource> {
    private cities: MilesCityMeta[] = [];
    private currentCityIndex = 0;

    async setAreas(cities: MilesCityMeta[]) {
        if (cities.toString() !== this.cities.toString()) {
            this.cities = cities
            this.observer.measure("cities", this.cities.length);
        }
    }

    start(): this {
        if (this.running) return this;
        this.running = true;
        this.cycle();
        return this;
    }

    stop(): this {
        if (!this.running) return this;
        this.running = false;
        return this;
    }

    async cycle() {
        if (!this.running) return;
        const success = await this.executeOnce();
        if (!success) {
            this.logWarn("Map scraping not successful, retrying in 15 seconds");
            this.retryCycle(1000 * 15);
            return;
        }
        await new Promise(resolve => setTimeout(resolve, this.cycleTime));
        this.cycle();
    }

    async executeOnce(): Promise<boolean> {
        const next = this.selectNextCity();
        if (next === null) return false;
        await this.fetch(next);
        return true;
    }

    async retryCycle(timeout: number) {
        await new Promise(resolve => setTimeout(resolve, timeout));
        this.cycle();
    }

    selectNextCity(): MilesCityMeta | null {
        if (this.cities.length === 0) {
            return null;
        }
        this.currentCityIndex = (this.currentCityIndex + 1) % this.cities.length;
        return this.cities[this.currentCityIndex];
    }

    async fetch(city: MilesCityMeta): Promise<void> {
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
            .setMaxConcurrent(16)
        applyMilesMapScrapingFilters(city, request, this.cycleTime);

        request.addEventListener("fetchCompleted", handleFetchResult);
        request.addEventListener("fetchRetry", (_: any, time: number) => this.observer.requestExecuted(RequestStatus.API_ERROR, time, city.idCity));

        const results = await request.execute();

        this.observer.measure("vehicles", vehicles.length, city.idCity);
        this.createLogPoint(city.idCity, vehicles, results.length, responseTimes, responseTypes);
    }

    handleFetchResult(result: FetchResult, cityId: string): { vehicles: apiVehicleJsonParsed[], responseTypes: ("OK" | "API_ERROR")[] } {
        const mapped = this.mapVehicleResponses(result.data);
        if (!result.filters.location) this.logWarn("No location filter in fetch result");

        this.observer.requestExecuted(RequestStatus.OK, result._time, cityId); // todo "OK" status isn't checked
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