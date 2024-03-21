import { minifyMilesCachedKeys, minifyMilesStatuses } from "./minifyUtils";
import { HistoryPoint } from "shared/api-types/api.types";

/**
 * Retrieve cached values and minimize them for bandwidth efficiency
 * @returns minified cache for api response
 */
export function createMinifiedHistoryResponse(historyPoints: HistoryPoint[], lastUpdateSeconds: number): string {
  // eslint-disable-next-line prettier/prettier
  return (
    lastUpdateSeconds + "\n" +
    minifyMilesCachedKeys() + "\n" +
    minifyMilesStatuses() + "\n" +
    minifyHistoryPoints(historyPoints)
  );
}

/**
 * csv Minify history points for bandwidth efficiency
 * @param historyPoints minified history points from cache
 */
export function minifyHistoryPoints(historyPoints: HistoryPoint[]): string {
  return historyPoints.map(point => point.join(",")).join("\n");
}
