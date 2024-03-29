import { MILES_HISTORY_KEYS_ARRAY, MILES_STATUS_CODES_ARRAY } from "shared/api-types/api.enums";

/**
 * csv status array for api response
 * @returns minified statuses
 */
export function minifyMilesStatuses(): string {
  return MILES_STATUS_CODES_ARRAY.join(",");
}

/**
 * csv key array for api response
 * @returns minified keys
 */
export function minifyMilesCachedKeys(): string {
  return MILES_HISTORY_KEYS_ARRAY.join(",");
}