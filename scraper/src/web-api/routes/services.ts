import { SystemController } from "../../SystemController";
import { publicProcedure, router } from "../trpc";

export const servicesRouter = router({
    list: publicProcedure.query(({ ctx }) => {

        const scrapers = [];
        for (const [scraperId, observed] of ctx.systemController.scrapers) {
            scrapers.push({
                name: scraperId,
                cycleMs: observed.scraper.cycleTime,
                requests: observed.observer.requests,
                running: observed.scraper.running
            });
        }

        return { scrapers: scrapers };

    })
})