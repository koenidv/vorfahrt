"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)({ path: ".env" });
const assertString = (value, key) => {
    if (typeof value !== "string" || value.length < 1) {
        throw new Error(`invalid .env: ${key} missing`);
    }
    return value;
};
const env = {
    milesAccountEmail: assertString(process.env.MILES_ACCOUNT_EMAIL, "MILES_ACCOUNT_EMAIL"),
    milesAccountPassword: assertString(process.env.MILES_ACCOUNT_PASSWORD, "MILES_ACCOUNT_PASSWORD"),
};
exports.default = env;
