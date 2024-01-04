import { Point, WriteApi } from "@influxdata/influxdb-client";
import { Scraper } from "./BaseScraper";
import clc from "cli-color";
import { GenericNumberMetric, RequestMetric, RequestStatus } from "./types";
import { eventEmitter } from "./EventEmitter";

const LOG_ON_MEAUSRE = true;

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
            console.error(clc.bgRed(`Observer | ${this.scraperId}`), clc.red("responseTime is not a number"), this.scraperId);
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
        if (LOG_ON_MEAUSRE) {
            console.log(clc.bgBlackBright(`Observer | ${this.scraperId}`), `Request executed: ${status} in`, responseTime, "ms");
        }
        eventEmitter.emit("request-executed", this.scraperId, status, responseTime);
    }

    measure(metricName: string, value: number) {
        if (process.argv.includes("--no-measure")) return;
        if (typeof value !== "number" || isNaN(value)) {
            console.error(clc.bgRed(`Observer | ${this.scraperId}`), clc.red(metricName, "is not a number"), this.scraperId);
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
                .tag("serviceId", this.scraperId)
                .intField(metricName, value))
        if (LOG_ON_MEAUSRE) {
            console.log(clc.bgBlackBright(`Observer | ${this.scraperId}`), `Measured ${metricName}:`, value);
        }
    }

    savePoint(point: Point) {
        this.writeClient.writePoint(point);
    }

}