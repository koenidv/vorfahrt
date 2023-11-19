import { MilesClient } from "@koenidv/abfahrt";
import { Scraper } from "../ScraperInterface";
import { QueryPriority } from "./Scraping/MilesScraperVehicles";
import { apiVehicleJsonParsed } from "@koenidv/abfahrt/dist/src/miles/apiTypes";
import { SystemObserver } from "../SystemObserver";

export abstract class BaseMilesScraper<T> implements Scraper {
    public scraperId: string;
    protected abfahrt: MilesClient;
    protected listeners: ((data: T[], source: QueryPriority | string) => void)[] = [];

    private cycleTime: number;
    private interval: NodeJS.Timeout;

    constructor(abfahrt: MilesClient, cyclesMinute: number, scraperId: string) {
        this.abfahrt = abfahrt;
        this.cycleTime = 1000 / (cyclesMinute / 60);
        this.scraperId = scraperId;
        SystemObserver.registerScraper(this);
        console.log(this.scraperId, `Initialized with ${+cyclesMinute.toFixed(3)}c/min (${+this.cycleTime.toFixed(3)}ms/c)`)
    }

    start(): this {
        this.interval = setInterval(this.cycle.bind(this), this.cycleTime);
        return this;
    }

    stop(): this {
        clearInterval(this.interval);
        return this;
    }

    addListener(listener: (vehicles: T[], source: QueryPriority | string) => void): this {
        this.listeners.push(listener);
        return this;
    }

    abstract cycle()

    abstract popSystemStatus(): { [key: string]: number };

}