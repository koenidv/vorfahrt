import { apiVehicleJsonParsed } from "@koenidv/abfahrt/dist/src/miles/apiTypes";
import { BaseMilesScraper } from "../BaseMilesScraper";
import { MilesCityAreaBounds } from "../Miles.types";
import { GetVehiclesResponse } from "@koenidv/abfahrt/dist/src/miles/net/getVehicles";
import { JsonParseBehaviour, applyJsonParseBehaviourToVehicle } from "@koenidv/abfahrt";
import { Point } from "@influxdata/influxdb-client";
import { SystemObserver } from "../../SystemObserver";
import { FetchResult } from "@koenidv/abfahrt/dist/src/miles/MilesAreaSearch";
import { applyMilesMapScrapingFilters } from "./applyMilesMapScrapingFilters";

export default class MilesScraperMap extends BaseMilesScraper<apiVehicleJsonParsed> {
    private cities: MilesCityAreaBounds[] = [];
    private _cycles = 0;

    setAreas(cities: MilesCityAreaBounds[]) {
        if (cities.toString() !== this.cities.toString()) {
            this.cities = cities;
            this.log("Now tracking", this.cities.length, "cities");
        }
        this.observer.measure(this, "cities", this.cities.length);
    }

    async cycle(): Promise<{ data: apiVehicleJsonParsed[] } | null> {
        const vehicles = await this.fetch(this.selectNextCity());
        return vehicles === null ? null : { data: vehicles };
    }

    selectNextCity(): MilesCityAreaBounds | null {
        if (this.cities.length === 0) {
            this.logWarn("No cities in queue: cycle will be skipped")
            return null;
        }
        return this.cities[this._cycles % this.cities.length];
    }

    async fetch(city: MilesCityAreaBounds): Promise<apiVehicleJsonParsed[] | null> {
        this._cycles++;
        const responseTimes: number[] = [];
        const responseTypes: ("OK" | "API_ERROR")[] = [];
        const vehicles: apiVehicleJsonParsed[] = [];

        const handleFetchResult = (result: FetchResult) => {
            const {
                vehicles: thisVehicles,
                responseTypes: thisResponseTypes
            } = this.handleFetchResult(result, city.cityId);
            vehicles.push(...thisVehicles);
            responseTimes.push(result._time);
            responseTypes.push(...thisResponseTypes);
        }

        const request = this.abfahrt.createVehicleSearch(city.area)
            .setMaxConcurrent(10)
        applyMilesMapScrapingFilters(city, request);

        request.addEventListener("fetchCompleted", handleFetchResult);
        request.addEventListener("fetchRetry", (_: any, time: number) => this.observer.requestExecuted(this, "API_ERROR", time));

        const results = await request.execute();

        this.observer.measure(this, "vehicles", vehicles.length);
        this.createLogPoint(city.cityId, vehicles.length, results.length, responseTimes, responseTypes);
        return null; // listeners are already called per request result
    }

    handleFetchResult(result: FetchResult, cityId: string): { vehicles: apiVehicleJsonParsed[], responseTypes: ("OK" | "API_ERROR")[] } {
        const mapped = this.mapVehicleResponses(result.data);

        this.observer.requestExecuted(this, "OK", result._time); // todo "OK" status isn't checked
        this.listeners.forEach(listener => listener(mapped.vehicles, cityId));
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

    createLogPoint(cityId: string, vehicleCount: number, requestCount: number, responseTimes: number[], responseTypes: ("OK" | "API_ERROR")[]) {
        const averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        const responseTypesCount = responseTypes.reduce((acc, cur) => {
            acc[cur] = (acc[cur] ?? 0) + 1;
            return acc;
        }, {} as { [key: string]: number });

        const point = new Point(`${this.scraperId}-citylog`)
            .tag("scraper", this.scraperId)
            .tag("city", cityId)
            .intField("vehicles", vehicleCount)
            .intField("requests", requestCount)
            .intField("averageResponseTime", averageResponseTime || 0)
            .intField("OK", responseTypesCount["OK"] || 0)
            .intField("API_ERROR", responseTypesCount["API_ERROR"] || 0)

        this.observer.savePoint(point);
    }

}