import { DataSource } from "typeorm";
import MilesController from "./Miles/MilesController";
import { Scraper } from "./BaseScraper";
import { Observer } from "./Observer";
import { WriteApi } from "@influxdata/influxdb-client";

type ObservedScraper = {
    scraper: Scraper;
    observer: Observer;
}

export class SystemController {
    private _observerWriteClient: WriteApi;
    private _scrapers = new Map<string, ObservedScraper>();
    public get scrapers() {
        return this._scrapers;
    }

    private milesController: MilesController | undefined;

    constructor(observerWriteClient: WriteApi) {
        this._observerWriteClient = observerWriteClient;
    }

    registerScraper(scraper: Scraper): Observer {
        if (this.scrapers.has(scraper.scraperId)) {
            throw new Error(`Scraper ${scraper.scraperId} already registered`);
        }
        const observer = new Observer(scraper.scraperId, this._observerWriteClient);
        this.scrapers.set(scraper.scraperId, {
            scraper,
            observer
        });
        return observer;
    }

    createMilesScraper(appDataSource: DataSource): this {
        this.milesController = new MilesController(this, appDataSource);
        return this;
    }
}