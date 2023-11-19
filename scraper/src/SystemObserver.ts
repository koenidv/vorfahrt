import { Point, WriteApi } from "@influxdata/influxdb-client";
import { Scraper } from "./ScraperInterface";

export class SystemObserver {
    private static _instance: SystemObserver = undefined;
    public static get instance(): SystemObserver {
        if (SystemObserver._instance === undefined) {
            throw new Error("SystemObserver not initialized");
        }
        return SystemObserver._instance;
    }

    writeClient: WriteApi;

    static scrapers: Scraper[] = []
    interval: NodeJS.Timeout;

    constructor(writeClient: WriteApi) {
        if (SystemObserver._instance !== undefined) {
            console.warn("SystemObserver", "SystemObserver was already initialized. All SystemObservers obserce the same data.");
        }
        this.writeClient = writeClient;
        SystemObserver._instance = this;
    }

    start(): this {
        this.interval = setInterval(this.saveSystemStatus.bind(this), 10000);
        return this;
    }

    static registerScraper(scraper: Scraper) {
        this.scrapers.push(scraper);
    }

    static savePoint(point: Point) {
        if (this.instance === undefined) {
            throw new Error("SystemObserver not initialized");
        }
        this.instance.writeClient.writePoint(point);
    }

    private async saveSystemStatus() {
        SystemObserver.scrapers.forEach(this.saveScraperSystemStatus, this)
    }

    private async saveScraperSystemStatus(scraper: Scraper) {
        try {
            const status = scraper.popSystemStatus();
            const statusPoint = new Point("scraper_status")
                .tag("serviceId", scraper.scraperId)

            Object.entries(status).forEach(([key, value]) => {
                if (typeof value === "number" && !isNaN(value)) {
                    statusPoint.floatField(key, value);
                }
            })

            this.writeClient.writePoint(statusPoint);
        } catch (e) {
            console.error("SystemObserver", "Error while saving system status", e);
        }
    }

}