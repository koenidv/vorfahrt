import { mapScrapingServiceRouter } from "./routes/mapScrapingService";
import { servicesRouter } from "./routes/services";
import { systemRouter } from "./routes/system";
import { router } from "./trpc";

export const appRouter = router({
    services: servicesRouter,
    mapScrapingService: mapScrapingServiceRouter,
    system: systemRouter,
});

export type AppRouter = typeof appRouter;