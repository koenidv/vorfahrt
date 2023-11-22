import { z } from "zod";
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
    }),
    start: publicProcedure
        .input(z.string())
        .mutation(({ ctx, input }) => {
            const result = ctx.systemController.startService(input);
            if (result instanceof Error) {
                return { success: false, error: result.message }
            }
            return { success: true };
        }),
    stop: publicProcedure
        .input(z.string())
        .mutation(({ ctx, input }) => {
            const result = ctx.systemController.stopService(input);
            if (result instanceof Error) {
                return { success: false, error: result.message }
            }
            return { success: true };
        }),
});