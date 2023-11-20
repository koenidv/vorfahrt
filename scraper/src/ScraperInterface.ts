import { MilesClient } from "@koenidv/abfahrt";

export interface Scraper {
    scraperId: string;
    cycleTime: number;
    start(): this;
    stop(): this;
}