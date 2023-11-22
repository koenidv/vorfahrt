import { SystemController } from "../SystemController";
import { servicesRouter } from "./routes/services";
import { router } from "./trpc";


export const appRouter = router({
    services: servicesRouter,
});

export type AppRouter = typeof appRouter;