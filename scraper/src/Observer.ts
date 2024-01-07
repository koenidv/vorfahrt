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

    requestExecuted(status: RequestStatus, responseTime: number, info?: string | number) {
        if (typeof responseTime !== "number" || isNaN(responseTime)) {
            console.error(clc.bgRed(`Observer | ${this.scraperId}`), clc.red("responseTime is not a number"), this.scraperId);
            return;
        }
        this.requests.push({
            status,
            responseTime,
            timestamp: Date.now()
        })
        const logPoint = new Point("requests")
            .tag("serviceId", this.scraperId)
            .tag("status", status)
            .intField("responseTime", responseTime)
        if (info) logPoint.tag("info", info.toString());
        this.writeClient.writePoint(logPoint)
        if (LOG_ON_MEAUSRE) {
            console.log(clc.bgBlackBright(`Observer | ${this.scraperId}`), `Request executed${info ? ` (${info})` : ""}: ${status} in`, responseTime, "ms");
        }
        eventEmitter.emit("request-executed", this.scraperId, status, responseTime);
    }

    measure(metricName: string, value: number, info?: string | number) {
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
        const logPoint = new Point("measures")
            .tag("serviceId", this.scraperId)
            .intField(metricName, value)
        if (info) logPoint.tag("info", info.toString());
        this.writeClient.writePoint(logPoint);
        if (LOG_ON_MEAUSRE) {
            console.log(clc.bgBlackBright(`Observer | ${this.scraperId}`), `Measured ${metricName}${info ? ` (${info})` : ""}:`, value);
        }
    }

    savePoint(point: Point) {
        this.writeClient.writePoint(point);
    }

}