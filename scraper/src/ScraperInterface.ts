import { MilesClient } from "@koenidv/abfahrt";

export interface Scraper {
    scraperId: string;
    start(): this;
    stop(): this;
    popSystemStatus(): { [key: string]: number };
}