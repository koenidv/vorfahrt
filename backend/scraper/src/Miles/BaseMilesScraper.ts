import { MilesClient } from "@koenidv/abfahrt";
import { BaseScraper } from "../BaseScraper";
import { SystemController } from "../SystemController";
import { BaseScraperCycled } from "../BaseScraperCycled";

export abstract class BaseMilesScraper<T, S> extends BaseScraper<T, S> {
    protected abfahrt: MilesClient;
    constructor(abfahrt: MilesClient, cyclesMinute: number, scraperId: string, systemController: SystemController) {
        super(cyclesMinute, scraperId, systemController);
        this.abfahrt = abfahrt;
    }
}

export abstract class BaseMilesScraperCycled<T, S> extends BaseScraperCycled<T, S> {
    protected abfahrt: MilesClient;
    constructor(abfahrt: MilesClient, cyclesMinute: number, scraperId: string, systemController: SystemController) {
        super(cyclesMinute, scraperId, systemController);
        this.abfahrt = abfahrt;
    }
}
