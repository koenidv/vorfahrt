import { initTRPC } from "@trpc/server";
import * as trpcExpress from '@trpc/server/adapters/express';
import { SystemController } from "../SystemController";

export function createCreateContext(systemController: SystemController) {
    return ({
        req,
        res,
    }: trpcExpress.CreateExpressContextOptions) => {

        //console.log(req.headers.authorization)

        return {

            systemController: systemController,
        }
    };
}
export type Context = Awaited<ReturnType<ReturnType<typeof createCreateContext>>>;

const t = initTRPC.context<Context>().create();
export const router = t.router;
export const publicProcedure = t.procedure;