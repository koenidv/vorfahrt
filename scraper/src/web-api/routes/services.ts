import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import { eventEmitter } from "../../EventEmitter";
import { observable } from "@trpc/server/observable";
import { aggregateSumByCategory } from "../utils/aggregate";
import { AggregatedMetric, RequestStatus } from "../../types";
import type { EventTypes } from "../../EventEmitter";

export const servicesRouter = router({
    list: publicProcedure.query(({ ctx }) => {
        const services: { [key: string]: { id: string, running: boolean, cycleMs: number, type: "scraper" } } = {};
        for (const [scraperId, observed] of ctx.systemController.scrapers) {
            services[scraperId] = ({
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
    details: publicProcedure
        .input(z.string())
        .subscription(({ ctx, input: serviceId }) => {
            return observable<{ id: string, running: boolean, cycleMs: number, type: string, requests: AggregatedMetric[] }>((emit) => {

                const scraper = ctx.systemController.scrapers.get(serviceId);
                if (!scraper) {
                    emit.error("No service with this id");
                    return;
                }
                let running = scraper.scraper.running;
                const requests = scraper.observer.requests;
                let lastUpdate = Date.now();

                const statusChanged = (id: string, newRunning: boolean) => {
                    if (id !== serviceId) return;
                    running = newRunning;
                    emitCurrent();
                }
                eventEmitter.on("service-status-changed", statusChanged);

                const requestExecuted = (id: string, status: RequestStatus, responseTime: number) => {
                    if (id !== serviceId) return;
                    // requests.push({
                    //     timestamp: Date.now(),
                    //     status,
                    //     responseTime,
                    // });
                    if (lastUpdate < Date.now() - 1000) {
                        emitCurrent();
                    }
                }
                eventEmitter.on("request-executed", requestExecuted);

                const emitCurrent = () => {
                    lastUpdate = Date.now();
                    const requestsAggregated = aggregateSumByCategory(requests, "status", () => 1, 1000, Date.now() - 60 * 1000, Date.now());
                    emit.next({
                        id: scraper.scraper.scraperId,
                        running,
                        cycleMs: scraper!.scraper.cycleTime,
                        type: "scraper",
                        requests: requestsAggregated,
                    });
                }

                emitCurrent();

                return () => {
                    eventEmitter.off("service-status-changed", statusChanged);
                    eventEmitter.off("request-executed", requestExecuted);
                }
            });
        })
});