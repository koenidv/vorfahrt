export enum MILES_STATUS_CODES {
    IN_RELOCATION_TRIP,
    IN_EXTERNAL_OPS,
    AT_MILES_REPAIR,
    DEPLOYED_FOR_INTERNAL_USE,
    IN_REPAIR,
    USER_IN_RIDE,
    CAR_SUBSCRIPTION,
    AT_MILES_VRC,
    IN_CLAIMS,
    AT_EXTERNAL_REPAIR,
    DEPLOYED_FOR_RENTAL,
    DOWNFITTING,
    IN_FIELD_REPAIR,
    AT_MOSTKI_VRC,
    DOWNFITTED,
    AT_MOSTKI_BODYSHOP,
    RETIRED,
    AT_UPFITTING,
    PAUSED_BY_USER,
    IN_LOGISTICS,
    BOOKED_BY_USER,
    UPFITTING,
    IN_OPS,
    FRAUD
}

export const MILES_STATUS_CODES_ARRAY = [
    "IN_RELOCATION_TRIP",
    "IN_EXTERNAL_OPS",
    "AT_MILES_REPAIR",
    "DEPLOYED_FOR_INTERNAL_USE",
    "IN_REPAIR",
    "USER_IN_RIDE",
    "CAR_SUBSCRIPTION",
    "AT_MILES_VRC",
    "IN_CLAIMS",
    "AT_EXTERNAL_REPAIR",
    "DEPLOYED_FOR_RENTAL",
    "DOWNFITTING",
    "IN_FIELD_REPAIR",
    "AT_MOSTKI_VRC",
    "DOWNFITTED",
    "AT_MOSTKI_BODYSHOP",
    "RETIRED",
    "AT_UPFITTING",
    "PAUSED_BY_USER",
    "IN_LOGISTICS",
    "BOOKED_BY_USER",
    "UPFITTING",
    "IN_OPS",
    "FRAUD"
]

export enum MILES_HISTORY_KEYS {
    charge,
    charging,
    damageCount,
    discounted,
    latitude,
    longitude,
    range,
    status
}

export const MILES_HISTORY_KEYS_ARRAY = [
    "charge",
    "charging",
    "damageCount",
    "discounted",
    "latitude",
    "longitude",
    "range",
    "status"
]