export interface Scraper {
    scraperId: string;
    start(): void;
    stop(): void;
    popSystemStatus(): { [key: string]: number };
}