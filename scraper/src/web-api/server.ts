import express from "express";
import { SystemObserver } from "../SystemObserver";

export class WebApiServer {
    private app: express.Application;
    private observer: SystemObserver;

    constructor(observer: SystemObserver) {
        this.app = express();
        this.observer = observer;
        this.prepareRoutes();
    }

    private prepareRoutes() {
        this.app.get('/', (req, res) => {

            // todo Maps are not iterable and thus not serialized by JSON.stringify
            res.send({});
        });
    }

    public start(port: number = 3000): this {
        this.app.listen(port, () => {
            console.log(`Example app listening at http://localhost:${port}`)
        });
        return this;
    }

}