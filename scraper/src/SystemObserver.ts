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
        this.interval = setInterval(this.saveSystemStatus.bind(this), 10000);
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
        try {
            const status = scraper.popSystemStatus();
            const statusPoint = new Point("scraper_status")
                .tag("serviceId", scraper.scraperId)

            Object.entries(status).forEach(([key, value]) => {
                if (typeof value === "number" && !isNaN(value)) {
                    statusPoint.floatField(key, value);
                } else {
                    console.warn("SystemObserver", `System status value ${key} from ${scraper.scraperId} is not a number`, value);
                }
            })

            this.writeClient.writePoint(statusPoint);
        } catch (e) {
            console.error("SystemObserver", "Error while saving system status", e);
        }
    }

}