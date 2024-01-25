import { QueryPriority } from "../../src/Miles/Scraping/MilesScraperVehicles";
import { VehicleQueue } from "../../src/Miles/utils/VehicleQueue";

describe("VehicleQueue", () => {

    test("should insert and remove", () => {
        const queue = new VehicleQueue();
        queue.insert([1, 2, 3], QueryPriority.NORMAL);
        queue.insert([4, 5, 6], QueryPriority.LOW);
        expect(queue.getQueue()).toEqual([
            { milesId: 1, priority: QueryPriority.NORMAL, fromInit: false },
            { milesId: 2, priority: QueryPriority.NORMAL, fromInit: false },
            { milesId: 3, priority: QueryPriority.NORMAL, fromInit: false },
            { milesId: 4, priority: QueryPriority.LOW, fromInit: false },
            { milesId: 5, priority: QueryPriority.LOW, fromInit: false },
            { milesId: 6, priority: QueryPriority.LOW, fromInit: false },
        ])
        queue.remove([1, 2, 3, 4]);
        expect(queue.getQueue()).toEqual([
            { milesId: 5, priority: QueryPriority.LOW, fromInit: false },
            { milesId: 6, priority: QueryPriority.LOW, fromInit: false },
        ])
    })

    test("should replace priority when inserting same id", () => {
        const queue = new VehicleQueue();
        queue.insert([1, 2, 3], QueryPriority.NORMAL);
        queue.insert([1, 2], QueryPriority.LOW);
        expect(queue.getQueue()).toEqual([
            { milesId: 1, priority: QueryPriority.LOW, fromInit: false },
            { milesId: 2, priority: QueryPriority.LOW, fromInit: false },
            { milesId: 3, priority: QueryPriority.NORMAL, fromInit: false },
        ])
    })

    test("should get queue sizes", () => {
        const queue = new VehicleQueue();
        queue.insert([1, 2, 3], QueryPriority.NORMAL);
        queue.insert([4, 5, 6], QueryPriority.LOW);
        queue.insert([7, 8], QueryPriority.HIGH);
        expect(queue.getQueueSizes()).toEqual({
            NORMAL: 3,
            LOW: 3,
            HIGH: 2
        })
    })

    test("should select random", () => {
        const queue = new VehicleQueue();
        queue.insert([1, 2, 3], QueryPriority.NORMAL);
        queue.insert([4, 5, 6], QueryPriority.LOW);
        queue.insert([7, 8], QueryPriority.HIGH);
        const random = queue.getRandom();
        expect(random).not.toBeNull();
        expect(random?.id).toBeGreaterThanOrEqual(1);
        expect(random?.id).toBeLessThanOrEqual(8);
        expect(random?.priority).not.toBeNull();
        if (random?.priority !== QueryPriority.HIGH) console.warn("random selection was not high priority")
    })

    test("should not select null values", () => {
        const queue = new VehicleQueue();
        queue.insert([1], QueryPriority.LOW);
        queue.insert([2], null);
        const random = queue.getRandom();
        expect(random).not.toBeNull();
        expect(random?.id).toBe(1);
        expect(random?.priority).not.toBeNull();
    })

    test("should return null if queue is empty", () => {
        const queue = new VehicleQueue();
        const random = queue.getRandom();
        expect(random).toBeNull();
    })

    test("random selection should not overflow", () => {
        const queue = new VehicleQueue();
        for (let i = 0; i < 8000; i++) {
            queue.insert([i], QueryPriority.HIGH);
            queue.insert([i + 8000], QueryPriority.NORMAL);
            queue.insert([i + 16000], QueryPriority.LOW);
            queue.insert([i + 24000], null);
        }
        const random = queue.getRandom();
        expect(random).not.toBeNull();
        expect(random?.id).toBeGreaterThanOrEqual(0);
        expect(random?.id).toBeLessThanOrEqual(16000);
        expect(random?.priority).not.toBeNull();
        if (random?.priority !== QueryPriority.HIGH) console.warn("random selection was not high priority")
    })

    test("items should not be removed from queue", () => {
        const queue = new VehicleQueue();
        queue.insert([1, 2, 3], QueryPriority.NORMAL);
        queue.insert([4, 5], null);
        for (let i = 0; i < 100; i++) {
            const random = queue.getRandom();
            expect(random).not.toBeNull();
            expect(random?.id).toBeGreaterThanOrEqual(1);
            expect(random?.id).toBeLessThanOrEqual(3);
            expect(random?.priority).not.toBeNull();
        }
        expect(queue.queue.size).toBe(5);
    })

    test("init status should change even when inserted priority is the same", () => {
        const queue = new VehicleQueue();
        queue.insert([1, 2, 3], QueryPriority.NORMAL, true);
        queue.insert([1, 2], QueryPriority.NORMAL, false);
        expect(queue.getQueue()).toEqual([
            { milesId: 1, priority: QueryPriority.NORMAL, fromInit: false },
            { milesId: 2, priority: QueryPriority.NORMAL, fromInit: false },
            { milesId: 3, priority: QueryPriority.NORMAL, fromInit: true },
        ])
    })

})