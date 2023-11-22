import { Point, WriteApi } from "@influxdata/influxdb-client";
import { Scraper } from "./BaseScraper";
import clc from "cli-color";
import { GenericNumberMetric, RequestMetric, RequestStatus } from "./types";

export class Observer {
    scraperId: string;
    private writeClient: WriteApi;

    requests: RequestMetric[] = [];
    metrics: { [key: string]: GenericNumberMetric[] } = {};

    constructor(scraperId: string, writeClient: WriteApi) {
        this.scraperId = scraperId;
        this.writeClient = writeClient;
    };

    requestExecuted(status: RequestStatus, responseTime: number) {
        if (typeof responseTime !== "number" || isNaN(responseTime)) {
            console.error(clc.bgRed("SystemObserver"), clc.red("responseTime is not a number"), this.scraperId);
            return;
        }
        this.requests.push({
            status,
            responseTime,
            timestamp: Date.now()
        })
        this.writeClient.writePoint(
            new Point("requests")
                .tag("serviceId", this.scraperId)
                .tag("status", status)
                .intField("responseTime", responseTime))
    }

    measure(scraper: Scraper, metricName: string, value: number) {
        if (typeof value !== "number" || isNaN(value)) {
            console.error(clc.bgRed("SystemObserver"), clc.red(metricName, "is not a number"), scraper.scraperId);
            return;
        }
        if (!this.metrics[metricName]) {
            this.metrics[metricName] = [];
        }
        this.metrics[metricName].push({
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

}