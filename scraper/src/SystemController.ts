import { DataSource } from "typeorm";
import MilesController from "./Miles/MilesController";
import { Scraper } from "./BaseScraper";
import { Observer } from "./Observer";
import { WriteApi } from "@influxdata/influxdb-client";
import clc from "cli-color";

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

    startService(serviceId: string): this | Error {
        const observed = this.scrapers.get(serviceId);
        if (!observed) {
            console.warn(clc.bgRedBright("SystemController"), clc.red(`Tried to start unknown scraper ${serviceId}`));
            return new Error(`No scraper with id ${serviceId} registered`);
        }
        observed.scraper.start();
        return this;
    }

    stopService(serviceId: string): this | Error {
        const observed = this.scrapers.get(serviceId);
        if (!observed) {
            console.warn(clc.bgRedBright("SystemController"), clc.red(`Tried to stop unknown scraper ${serviceId}`));
            return new Error(`No scraper with id ${serviceId} registered`);
        }
        observed.scraper.stop();
        return this;
    }

    setServiceSpeed(serviceId: string, cyclesMinute: number): this | Error {
        const observed = this.scrapers.get(serviceId);
        if (!observed) {
            console.warn(clc.bgRedBright("SystemController"), clc.red(`Tried to set speed of unknown scraper ${serviceId}`));
            return new Error(`No scraper with id ${serviceId} registered`);
        }
        observed.scraper.setSpeed(cyclesMinute);
        return this;
    }
}