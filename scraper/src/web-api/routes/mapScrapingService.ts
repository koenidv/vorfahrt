import { z } from "zod";
import { publicProcedure, router } from "../trpc";

export const mapScrapingServiceRouter = router({
    getKML: publicProcedure
        .input(z.string())
        .query(({ ctx, input }) => {
            const scraper = ctx.systemController.scrapers.get(input);
            if (!scraper) {
                return { success: false, error: "No scraper with this id" };
            }
            if (typeof scraper.scraper.generateAreasKML !== "function") {
                return { success: false, error: "This scraper does not support KML generation" };
            }

            return { success: true, kml: scraper.scraper.generateAreasKML() };
        }),
});