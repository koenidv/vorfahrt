import { HistoryPoint } from "shared/api-types/api.types";
import { Service } from "typedi";

@Service()
export class HistoryCacheModel {
  private historyItems: HistoryPoint[] = [];
  lastUpdate: number;

  isEmpty(): boolean {
    return this.historyItems.length === 0;
  }

  getAll(): HistoryPoint[] {
    if (this.isEmpty()) console.warn("Vehicle cache is empty");
    return [...this.historyItems];
  }

  save(batch: HistoryPoint[]): void {
    this.historyItems.push(...batch);
    this.lastUpdate = Date.now();
  }

  clear(): void {
    this.historyItems = [];
  }
}