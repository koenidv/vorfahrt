import clc from "cli-color";
import { BaseScraper } from "./BaseScraper";

export abstract class BaseScraperCycled<T, SourceType> extends BaseScraper<T, SourceType> {
    private interval: NodeJS.Timeout | undefined;

    start(): this {
        if (this.running) {
            this.logWarn("Already running");
            return this;
        }
        this.interval = setInterval(this.cycleNotifyListeners.bind(this), this.cycleTime);
        this.running = true;
        return this;
    }

    stop(): this {
        clearInterval(this.interval);
        this.running = false;
        return this;
    }

    executeOnce(): this {
        this.cycleNotifyListeners();
        return this;
    }

    private async cycleNotifyListeners() {
        let result = await this.cycle();
        if (result !== null) this.notifyListeners(result.data, result.source);
    }

    /*
     * Abstract methods
     */

    /**
     * This method is called every cycle and should return the scraped data.
     * @returns scraped data or null if no data was scraped
     */
    abstract cycle(): Promise<{ data: T[], source: SourceType } | null>;

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