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
        return Array.from(this.systemController.observer.scrapers.keys());
    }


}