import express from "express";
import { SystemController } from "../../SystemController";

export class ScraperRoutes {
    systemController: SystemController;
    router = express.Router();

    constructor(systemController: SystemController) {
        this.systemController = systemController;
        this.setupRoutes();
    }

    private setupRoutes() {
        this.router.get('/', (req, res) => {
            res.send(this.listScrapers());
        });

    }

    private listScrapers() {
        const scrapers = [];
        for (const [scraperId, observed] of this.systemController.scrapers) {
            scrapers.push({
                name: scraperId,
                cyclesMinute: observed.scraper.cycleTime,
                requests: observed.observer.requests,
                running: observed.scraper.running
            });
        }

        return scrapers;
    }


}