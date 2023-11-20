import { apiVehicleJsonParsed } from "@koenidv/abfahrt/dist/src/miles/apiTypes";
import { BaseMilesScraper } from "../BaseMilesScraper";
import { MilesCityAreaBounds } from "../Miles.types";
import { FetchResult } from "@koenidv/abfahrt/dist/src/miles/MilesVehicleSearch";
import { GetVehiclesResponse } from "@koenidv/abfahrt/dist/src/miles/net/getVehicles";
import { JsonParseBehaviour, applyJsonParseBehaviourToVehicle } from "@koenidv/abfahrt";
import { Point } from "@influxdata/influxdb-client";
import { SystemObserver } from "../../SystemObserver";

export default class MilesScraperMap extends BaseMilesScraper<apiVehicleJsonParsed> {
    private cities: MilesCityAreaBounds[] = [];

    private _cycles = 0;
    private requestsExecuted: number = undefined;
    private vehiclesFound: number = undefined;
    private responseTimes: number[] = [];
    private responseTypes: ("OK" | "API_ERROR")[] = [];


    setAreas(cities: MilesCityAreaBounds[]) {
        if (cities.toString() !== this.cities.toString()) {
            this.cities = cities;
            this.log("Now tracking", cities.length, "cities")
        }
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
        const results = await this.abfahrt.createVehicleSearch(city.area).execute();

        const mapped = this.mapFetchResults(results);

        this.requestsExecuted = (this.requestsExecuted ?? 0) + results.length;
        this.vehiclesFound = (this.vehiclesFound ?? 0) + mapped.vehicles.length;
        this.responseTimes.push(...mapped.responseTimes);
        this.responseTypes.push(...mapped.responseTypes);

        this.createLogPoint(city.cityId, mapped.vehicles.length, results.length, mapped.responseTimes, mapped.responseTypes);
        return mapped.vehicles.length === 0 ? null : mapped.vehicles;
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

        SystemObserver.savePoint(point);
    }

    popSystemStatus(): { [key: string]: number; } {
        const averageResponseTime = this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length;
        const responseTypesCount = this.responseTypes.reduce((acc, cur) => {
            acc[cur] = (acc[cur] ?? 0) + 1;
            return acc;
        }, {} as { [key: string]: number });

        const status = {
            citiesCount: this.cities.length,
            requestsExecuted: this.requestsExecuted,
            vehiclesFound: this.vehiclesFound,
            averageResponseTime,
            OK: responseTypesCount["OK"] || 0,
            API_ERROR: responseTypesCount["API_ERROR"] || 0,
        }
        this.requestsExecuted = undefined;
        this.vehiclesFound = undefined;
        this.responseTimes = [];
        this.responseTypes = [];

        return status;
    }

}