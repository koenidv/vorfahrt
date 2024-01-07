import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import clc from "cli-color";

export const systemRouter = router({
    kill: publicProcedure
        .mutation(({ ctx }) => {
            console.warn(clc.red("Received kill signal via TRPC. Killing process."));
            process.exit(808);
        }),
});