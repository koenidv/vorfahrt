import express from "express";
import { SystemObserver } from "../SystemObserver";
import { SystemController } from "../SystemController";
import { ScraperRoutes } from "./routes/scraper";
import { RequestsRoutes } from "./routes/requests";

export class WebApiServer {
    private app: express.Application;
    private systemController: SystemController;

    constructor(systemController: SystemController) {
        this.app = express();
        this.systemController = systemController;
        this.createIndexRoute();

        this.app.use("/scraper", new ScraperRoutes(systemController).router);
        this.app.use("/requests", new RequestsRoutes(systemController).router);
    }

    private createIndexRoute() {
        this.app.get('/', (req, res) => {
            res.send('vorfahrt api');
        });

    }

    public start(port: number = 3000): this {
        this.app.listen(port, () => {
            console.log(`Example app listening at http://localhost:${port}`)
        });
        return this;
    }

}