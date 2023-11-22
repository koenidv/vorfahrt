import express from "express";
import { SystemController } from "../SystemController";
import * as trpcExpress from '@trpc/server/adapters/express';
import { createCreateContext } from "./trpc";
import { appRouter } from "./appRouter";

export class WebApiServer {
    private app: express.Application;
    private systemController: SystemController;

    constructor(systemController: SystemController) {
        this.app = express();
        this.systemController = systemController;

        this.app.use(
            "/",
            trpcExpress.createExpressMiddleware({
                router: appRouter,
                createContext: createCreateContext(systemController),
            })
        )
    }


    public start(port: number = 3000): this {
        this.app.listen(port, () => {
            console.log(`Example app listening at http://localhost:${port}`)
        });
        return this;
    }

}