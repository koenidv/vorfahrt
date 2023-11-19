import { Scraper } from "../../ScraperInterface";
import { QueryPriority } from "./MilesScraperVehicles";

export interface MilesScraper extends Scraper {
    //register(vehicleId: number[], source: QueryPriority | string): Scraper; TO BE IMPLEMENTED :)
}