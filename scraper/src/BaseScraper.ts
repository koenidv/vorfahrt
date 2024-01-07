import clc, { yellow } from "cli-color";
import { SystemController } from "./SystemController";
import { Observer } from "./Observer";
import { QueryPriority } from "./Miles/Scraping/MilesScraperVehicles";
import { eventEmitter } from "./EventEmitter";

export interface Scraper {
    [x: string]: any;
    scraperId: string;
    cycleTime: number;
    running: boolean;
    start(): this;
    stop(): this;
}

export abstract class BaseScraper<T, SourceType> implements Scraper {

    public scraperId: string;
    public cycleTime: number;
    private _running: boolean = false;
    public get running(): boolean {
        return this._running;
    }
    public set running(value: boolean) {
        this.log(clc.blue(`Service ${value ? "started" : "stopped"}`));
        eventEmitter.emit("service-status-changed", this.scraperId, value);
        this._running = value;
    }
    protected observer: Observer;
    protected listeners: ((data: T[], source: SourceType) => Promise<void>)[] = [];

    constructor(cyclesMinute: number, scraperId: string, systemController: SystemController) {
        this.cycleTime = 1000 / (cyclesMinute / 60);
        this.scraperId = scraperId;
        this.observer = systemController.registerScraper(this);
        this.log(clc.blue(`Initialized with ${+cyclesMinute.toFixed(3)}c/min (${+(this.cycleTime / 1000).toFixed(4)}s/c)`))
    }

    abstract start(): this;
    abstract stop(): this;
    abstract executeOnce(): Promise<boolean>; // success boolean

    addListener(listener: (data: T[], source: SourceType) => Promise<void>): this {
        this.listeners.push(listener);
        return this;
    }

    protected notifyListeners(data: T[], source: SourceType) {
        // deep copy (https://sematext.com/blog/nodejs-memory-leaks/#properly-using-closures-timers-and-event-handlers)
        const copy = Object.assign({}, { data, source });
        data = [];
        this.listeners.map(listener => listener(copy.data, copy.source));
    }

    /*
     * Logging
     */

    protected log(...args: any[]) {
        console.log(clc.bgBlackBright(this.scraperId), ...args);
    }

    protected logWarn(...args: any[]) {
        console.warn(clc.bgYellow(this.scraperId), clc.yellow(...args));
    }

    protected logError(...args: any[]) {
        console.error(clc.bgRed(this.scraperId), clc.red(...args));
    }

}