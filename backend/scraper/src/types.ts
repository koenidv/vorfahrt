export type AggregatedMetric = {
    data: { [key: string]: number },
    _start: number,
    _end: number,
}

export type Timestamped = {
    timestamp: number
}

export type GenericNumberMetric = Timestamped & {
    value: number,
}

export type RequestMetric = Timestamped & {
    status: RequestStatus,
    responseTime: number,
}

export type ValueSource = {
    source: SOURCE_TYPE,
}
export enum SOURCE_TYPE {
    PERCENTAGE = "percentage",
    MAP = "map",
    CITY_META = "city-meta",
    VEHICLE = "vehicle",
}

export enum RequestStatus {
    OK = "OK",
    API_ERROR = "API_ERROR",
    NOT_FOUND = "NOT_FOUND",
    SCRAPER_ERROR = "SCRAPER_ERROR",
}