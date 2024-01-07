import { mapScrapingServiceRouter } from "./routes/mapScrapingService";
import { servicesRouter } from "./routes/services";
import { router } from "./trpc";


export const appRouter = router({
    services: servicesRouter,
    mapScrapingService: mapScrapingServiceRouter,
});

export type AppRouter = typeof appRouter;