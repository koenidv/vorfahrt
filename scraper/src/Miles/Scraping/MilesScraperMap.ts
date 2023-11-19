import { apiVehicleJsonParsed } from "@koenidv/abfahrt/dist/src/miles/apiTypes";
import { BaseMilesScraper } from "../BaseMilesScraper";
import { MilesCityAreaBounds } from "../Miles.types";

export default class MilesScraperMap extends BaseMilesScraper<apiVehicleJsonParsed> {
    private cities: MilesCityAreaBounds[] = [];

    setAreas(cities: MilesCityAreaBounds[]) {
        this.cities = cities;
        console.log(this.scraperId, `Applied ${cities.length} cities`)
    }
    
    cycle() {
        throw new Error("Method not implemented.");
    }

    popSystemStatus(): { [key: string]: number; } {
        throw new Error("Method not implemented.");
    }

    private async execute(city: any) {

    }


}