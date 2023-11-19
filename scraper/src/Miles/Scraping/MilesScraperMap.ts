import { apiVehicleJsonParsed } from "@koenidv/abfahrt/dist/src/miles/apiTypes";
import { BaseMilesScraper } from "../BaseMilesScraper";
import { MilesCityAreaBounds } from "../Miles.types";
import { FetchResult } from "@koenidv/abfahrt/dist/src/miles/MilesVehicleSearch";
import { GetVehiclesResponse } from "@koenidv/abfahrt/dist/src/miles/net/getVehicles";
import { JsonParseBehaviour, applyJsonParseBehaviourToVehicle } from "@koenidv/abfahrt";

export default class MilesScraperMap extends BaseMilesScraper<apiVehicleJsonParsed> {
    private cities: MilesCityAreaBounds[] = [];

    private _cycles = 0;
    private requestsExecuted = 0;
    private responseTimes: number[] = [];


    setAreas(cities: MilesCityAreaBounds[]) {
        this.cities = cities;
        this.cycle();
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
        return this.cities[0];
    }

    async fetch(city: MilesCityAreaBounds): Promise<apiVehicleJsonParsed[] | null> {
        this._cycles++;
        const results = await this.abfahrt.createVehicleSearch(city.area).execute();

        const mapped = this.mapFetchResults(results);

        this.responseTimes.push(...mapped.responseTimes);
        this.requestsExecuted += results.length;
        console.log(mapped.vehicles)

        return mapped.vehicles.length === 0 ? null : mapped.vehicles;
        // todo influx log point
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
        console.log(response)
        const responseTypes: ("OK" | "API_ERROR")[] = [];

        const vehicles = response.flatMap(result => {
            responseTypes.push(result.Result === "OK" ? "OK" : "API_ERROR")
            return result.Data.vehicles.map(
                vehicle => applyJsonParseBehaviourToVehicle(vehicle, JsonParseBehaviour.PARSE));
        });

        return { vehicles, responseTypes };
    }


    popSystemStatus(): { [key: string]: number; } {
        return {
            citiesCount: this.cities.length
        }
    }

}