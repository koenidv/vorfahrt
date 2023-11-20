import { MilesClient } from "@koenidv/abfahrt";
import { Scraper } from "../ScraperInterface";
import { QueryPriority } from "./Scraping/MilesScraperVehicles";
import { SystemObserver } from "../SystemObserver";
import clc from "cli-color";

export abstract class BaseMilesScraper<T> implements Scraper {
    public scraperId: string;
    protected abfahrt: MilesClient;
    protected listeners: ((data: T[], source: QueryPriority | string) => void)[] = [];
    protected observer: SystemObserver;

    public cycleTime: number;
    private interval: NodeJS.Timeout;

    constructor(abfahrt: MilesClient, cyclesMinute: number, scraperId: string, observer = SystemObserver.instance()) {
        this.abfahrt = abfahrt;
        this.cycleTime = 1000 / (cyclesMinute / 60);
        this.scraperId = scraperId;
        this.observer = observer.registerScraper(this);
        this.log(clc.blue(`Initialized with ${+cyclesMinute.toFixed(3)}c/min (${+(this.cycleTime/1000).toFixed(4)}s/c)`))
    }

    start(): this {
        this.interval = setInterval(this.cycleNotifyListeners.bind(this), this.cycleTime);
        return this;
    }

    stop(): this {
        clearInterval(this.interval);
        return this;
    }

    executeNow(): this {
        this.cycleNotifyListeners();
        return this;
    }

    addListener(listener: (data: T[], source: QueryPriority | string) => void): this {
        this.listeners.push(listener);
        return this;
    }

    private async cycleNotifyListeners() {
        const result = await this.cycle();
        if (result !== null) {
            if (result.source === undefined) result.source = this.scraperId;
            this.listeners.forEach(listener => listener(result.data, this.scraperId));
        }
    }

    abstract cycle(): Promise<{ data: T[], source?: QueryPriority | string } | null>;

    protected log(...args: any[]) {
        console.log(clc.bgBlackBright(this.scraperId), ...args);
    }

    protected logWarn(...args: any[]) {
        console.warn(clc.bgBlackBright(this.scraperId), ...args);
    }

    protected logError(...args: any[]) {
        console.error(clc.bgBlackBright(this.scraperId), ...args);
    }

}
