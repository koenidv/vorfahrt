import clc, { yellow } from "cli-color";
import { SystemController } from "./SystemController";
import { SystemObserver } from "./SystemObserver";

export interface Scraper {
    scraperId: string;
    cycleTime: number;
    start(): this;
    stop(): this;
}

export abstract class BaseScraper<T> implements Scraper {

    public scraperId: string;
    public cycleTime: number;
    private observer: SystemObserver;
    private interval: NodeJS.Timeout;

    protected listeners: ((data: T[], source: string) => void)[] = [];

    constructor(cyclesMinute: number, scraperId: string, systemController: SystemController) {
        this.cycleTime = 1000 / (cyclesMinute / 60);
        this.scraperId = scraperId;
        this.observer = systemController.registerScraper(this);
        this.log(clc.blue(`Initialized with ${+cyclesMinute.toFixed(3)}c/min (${+(this.cycleTime / 1000).toFixed(4)}s/c)`))
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

    addListener(listener: (data: T[], source: string) => void): this {
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

    /*
     * Abstract methods
     */

    /**
     * This method is called every and should return the scraped data.
     * @returns scraped data or null if no data was scraped
     */
    abstract cycle(): Promise<{ data: T[], source?: string } | null>;

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