import { Service } from 'typedi';
import { HistoryCacheModel } from '@/models/history.model';
import { HistoryPoint } from '@vorfahrt/shared/api-types/api.types';
import { createMinifiedHistoryResponse } from '@/utils/minifyHistory';

/*
 * History output is non-standard csv to save bandwith
 * last update timestamp (seconds)
 * MEASUREMENT_KEY*0, MEASUREMENT_KEY*1, ...
 * STATUSCODE*0, STATUSCODE*1, ...
 * (for each vehicle) milesId, timestamp(seconds), keyId, value (value type depends on key, will be statusId for status)
 * ...
 */

@Service()
export class HistoryServingService {
  private historyCache: HistoryCacheModel;
  private cacheExpirationMs: number;

  constructor(cache: HistoryCacheModel, cacheExpiration = 4 * 5 * 60000) {
    this.historyCache = cache;
    this.cacheExpirationMs = cacheExpiration;
  }

  /**
   * Checks if the cache is empty or expired
   * @returns true if cache is empty or expired
   */
  private isCacheExpired(): boolean {
    if (this.historyCache.isEmpty()) return true;
    const now = Date.now();
    return (now - this.historyCache.lastUpdate) > this.cacheExpirationMs;
  }

  /**
   * Retrieve cached values and minimize them for bandwidth efficiency
   * @returns minified cache for api response
   */
  getResponse(): string {
    if (this.isCacheExpired()) {
      console.error("Tried to get history but cache is expired or empty");
      return null;
    }
    return createMinifiedHistoryResponse(this.getCachedValues(), this.historyCache.lastUpdate / 1000);
  }

  /**
   * Retrieve cached values
   * @returns cached history points
   */
  private getCachedValues(): HistoryPoint[] {
    return this.historyCache.getAll();
  }


}
