export interface Scraper {
    scraperId: string;
    start(): Scraper;
    stop(): Scraper;
    popSystemStatus(): { [key: string]: number };
}