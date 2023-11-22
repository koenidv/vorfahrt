import { Point, WriteApi } from "@influxdata/influxdb-client";
import { Scraper } from "./BaseScraper";
import clc from "cli-color";
import { GenericNumberMetric, RequestMetric, RequestStatus } from "./types";

type Observed = {
    requests: RequestMetric[],
    metrics: { [key: string]: GenericNumberMetric[] },
}

const SAVE_INTERVAL = 10000;

export class SystemObserver {
    private static _instance: SystemObserver = undefined;
    public static instance(): SystemObserver {
        if (SystemObserver._instance === undefined) {
            throw new Error("SystemObserver not initialized");
        }
        return SystemObserver._instance;
    }

    public static createInstance(writeClient: WriteApi): SystemObserver {
        if (SystemObserver._instance !== undefined) {
            throw new Error("SystemObserver already initialized");
        }
        SystemObserver._instance = new SystemObserver(writeClient);
        return SystemObserver._instance;
    }

    private constructor(writeClient: WriteApi) {
        this.writeClient = writeClient;
    };

    writeClient: WriteApi;

    scrapers = new Map<string, Observed>();
    interval: NodeJS.Timeout;

    start(): this {
        this.interval = setInterval(this.saveSystemStatus.bind(this), SAVE_INTERVAL);
        return this;
    }

    registerScraper(scraper: Scraper): this {
        if (this.scrapers.has(scraper.scraperId)) {
            throw new Error(`Scraper "${scraper.scraperId}" already registered`);
        }
        this.scrapers.set(scraper.scraperId, {
            requests: [],
            metrics: {},
        });
        return this;
    }

    requestExecuted(scraper: Scraper, status: RequestStatus, responseTime: number) {
        if (typeof responseTime !== "number" || isNaN(responseTime)) {
            console.error(clc.bgRed("SystemObserver"), clc.red("responseTime is not a number"), scraper.scraperId);
            return;
        }
        this.scrapers.get(scraper.scraperId).requests.push({
            status,
            responseTime,
            timestamp: Date.now()
        })
        this.writeClient.writePoint(
            new Point("requests")
                .tag("serviceId", scraper.scraperId)
                .tag("status", status)
                .intField("responseTime", responseTime))
    }

    measure(scraper: Scraper, metricName: string, value: number) {
        if (typeof value !== "number" || isNaN(value)) {
            console.error(clc.bgRed("SystemObserver"), clc.red(metricName, "is not a number"), scraper.scraperId);
            return;
        }
        const metrics = this.scrapers.get(scraper.scraperId).metrics;
        if (!metrics[metricName]) {
            metrics[metricName] = [];
        }
        metrics[metricName].push({
            value,
            timestamp: Date.now()
        })
        this.writeClient.writePoint(
            new Point("measures")
                .tag("serviceId", scraper.scraperId)
                .intField(metricName, value))
    }

    savePoint(point: Point) {
        this.writeClient.writePoint(point);
    }

    private async saveSystemStatus() {
        const points = []
        this.scrapers.forEach((observable, key) => {
            const point = this.createScraperStatusPoint(key, observable, SAVE_INTERVAL);
            if (point !== null) {
                points.push(point);
            }
        }, this)
        this.writeClient.writePoints(points);
    }

    private createScraperStatusPoint(scraperId: string, observable: Observed, timeframeMs: number): Point | null {
        try {
            const requests = observable.requests.filter(request => request.timestamp > Date.now() - timeframeMs);
            const measures = (Object.entries(observable.metrics) as Array<[string, GenericNumberMetric[]]>)
                .reduce((agg, [key, value]) => {
                    const values = value.filter(metric => metric.timestamp > Date.now() - timeframeMs);
                    if (values.length === 0) return agg;
                    const average = this.average(values.map(metric => metric.value));
                    if (isNaN(average)) {
                        console.error(clc.bgRed("SystemObserver"), clc.red("could not calculate average of", key),
                            scraperId, values.map(metric => metric.value));
                        return agg;
                    }
                    agg[key] = average;
                }, {} as { [key: string]: number });

            const statusPoint = new Point("scraper_status")
                .tag("serviceId", scraperId)

            if (requests.length !== 0) {
                statusPoint
                    .intField("requests", requests.length)
                    .intField("averageResponseTime", this.average(requests.map(request => request.responseTime)));
            }

            if (measures !== null && measures !== undefined) {
                Object.entries(measures).forEach(([key, value]) => {
                    if (typeof value === "number" && !isNaN(value)) {
                        statusPoint.floatField(key, value);
                    }
                });
            }

            return statusPoint;
        } catch (e) {
            console.error("SystemObserver", "Error while saving system status", e);
            return null;
        }
    }

    private average(values: number[]): number {
        return values.reduce((sum, value) => sum + value, 0) / values.length;
    }

}