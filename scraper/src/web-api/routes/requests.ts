import express from "express";
import { SystemController } from "../../SystemController";
import { RequestMetric } from "../../types";
import { aggregateSumBy } from "../utils/aggregate";
import { sliceMetrics } from "../utils/slice";

// todo replace with trpc version

export class RequestsRoutes {

    systemController: SystemController;
    router = express.Router();

    constructor(systemController: SystemController) {
        this.systemController = systemController;
        this.setupRoutes();
    }

    private setupRoutes() {
        this.router.get('/', (req, res) => {
            res.send(this.aggregateRequests());
        });

    }

    private aggregateRequests() {
        const requests: { [scraperId: string]: RequestMetric[] } = {};
        for (const [scraperId, observed] of this.systemController.scrapers) {
            requests[scraperId] = observed.observer.requests;
        }
        const aggregateWindow = 1000;
        const startDate = Date.now() - 1000 * 60 * 60 * 2;
        const endDate = Date.now();
        const aggregateWindows = Object.fromEntries(
            Object.entries(requests).map(([scraperId, scraperRequests]) => (
                [
                    scraperId,
                    aggregateSumBy(
                        sliceMetrics(scraperRequests, startDate, endDate),
                        () => 1, aggregateWindow, endDate)
                ])
            )
        )


        return aggregateWindows;
    }


}