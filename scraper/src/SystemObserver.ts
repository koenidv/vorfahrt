import { Point, WriteApi } from "@influxdata/influxdb-client";
import { Scraper } from "./ScraperInterface";

export class SystemObserver {
    writeClient: WriteApi;

    scrapers: Scraper[] = []
    interval: NodeJS.Timeout;

    constructor(writeClient: WriteApi) {
        this.writeClient = writeClient;
    }

    start(): this {
        this.interval = setInterval(this.saveSystemStatus, 10000);
        return this;
    }


    registerScraper(scraper: Scraper): this {
        this.scrapers.push(scraper);
        return this;
    }

    private async saveSystemStatus() {
        this.scrapers.forEach(this.saveScraperSystemStatus, this)
    }

    private async saveScraperSystemStatus(scraper: Scraper) {
        const status = scraper.popSystemStatus();
        const statusPoint = new Point()
            .tag("serviceType", "scraper")
            .tag("serviceId", scraper.scraperId)

        Object.entries(status).forEach(([key, value]) => {
            statusPoint.floatField(key, value);
        })

        this.writeClient.writePoint(statusPoint);
    }

}