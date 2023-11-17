import { MilesClient } from "@koenidv/abfahrt"
import MilesScraperVehicles, { QueryPriority } from "../../src/Miles/MilesScraperVehicles"

describe("MilesScraperVehicles", () => {

    const client = new MilesClient()
    const scraper = new MilesScraperVehicles(client, 5)

    it("should select properly between normal and low queues", () => {
        scraper.register(1, QueryPriority.NORMAL)
        scraper.register(2, QueryPriority.NORMAL)
        scraper.register(3, QueryPriority.NORMAL)
        scraper.register(4, QueryPriority.NORMAL)
        scraper.register(5, QueryPriority.NORMAL)
        scraper.register(6, QueryPriority.NORMAL)
        scraper.register(7, QueryPriority.NORMAL)
        scraper.register(8, QueryPriority.NORMAL)
        scraper.register(9, QueryPriority.LOW)
        scraper.register(10, QueryPriority.LOW)
        scraper.register(11, QueryPriority.LOW)

        scraper.start()
    })

})