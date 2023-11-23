import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import { eventEmitter } from "../../EventEmitter";
import { observable } from "@trpc/server/observable";

export const servicesRouter = router({
    list: publicProcedure.query(({ ctx }) => {
        const services = [];
        for (const [scraperId, observed] of ctx.systemController.scrapers) {
            services.push({
                id: scraperId,
                running: observed.scraper.running,
                cycleMs: observed.scraper.cycleTime,
                type: "scraper",
            });
        }

        return services;
    }),
    status: publicProcedure.subscription(() => {
        return observable<{ id: string, running: boolean }>((emit) => {
            const query = (id: string, running: boolean) => {
                emit.next({ id, running });
            }

            eventEmitter.on("service-status-changed", query);

            return () => {
                eventEmitter.off("service-status-changed", query);
            }
        });
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