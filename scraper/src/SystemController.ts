import { DataSource } from "typeorm";
import MilesController from "./Miles/MilesController";
import { Scraper } from "./BaseScraper";
import { SystemObserver } from "./SystemObserver";

export class SystemController {
    private _observer: SystemObserver;
    public get observer(): SystemObserver {
        // todo observer should be readonly, create a new one for each scraper
        return this._observer;
    }
    private _scrapers = new Map<string, Scraper>();
    public get scrapers() {
        return this._scrapers;
    }

    private milesController: MilesController;

    constructor(observer: SystemObserver) {
        this._observer = observer;
    }

    registerScraper(scraper: Scraper): SystemObserver {
        if (this.scrapers.has(scraper.scraperId)) {
            throw new Error(`Scraper ${scraper.scraperId} already registered`);
        }
        this.scrapers.set(scraper.scraperId, scraper);
        this.observer.registerScraper(scraper);
        return this.observer;
    }

    createMilesScraper(appDataSource: DataSource): this {
        this.milesController = new MilesController(this, appDataSource);
        return this;
    }
}