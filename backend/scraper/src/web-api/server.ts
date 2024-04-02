import express from "express";
import { SystemController } from "../SystemController";
import * as trpcExpress from '@trpc/server/adapters/express';
import { createCreateContext } from "./trpc";
import { AppRouter, appRouter } from "./appRouter";
import cors from "cors";
import ws from "ws";
import { applyWSSHandler } from '@trpc/server/adapters/ws';

export class WebApiServer {
    private app;
    private systemController: SystemController;

    constructor(systemController: SystemController) {
        this.app = express();
        this.systemController = systemController;

        this.app.use(cors({
            origin: "*",
            methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        }))

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
            console.log(`✅ tRPC/http Express Server listening on http://localhost:${port}`)
        });
        return this;
    }

    public startWs(port: number = 3001): this {
        const wss = new ws.Server({ port: port });

        const handler = applyWSSHandler<AppRouter>({
            wss: wss,
            router: appRouter,
            // fixme type
            // @ts-ignore
            createContext: createCreateContext(this.systemController)
        });
        wss.on('connection', (ws) => {
            console.log(`➕➕ Connection (${wss.clients.size})`);
            ws.once('close', () => {
                console.log(`➖➖ Connection (${wss.clients.size})`);
            });
        });
        console.log('✅ tRPC/ws Server listening on ws://localhost:${port}');
        process.on('SIGTERM', () => {
            console.log('SIGTERM');
            handler.broadcastReconnectNotification();
            wss.close();
        });

        return this;
    }

}