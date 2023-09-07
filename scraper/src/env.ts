import { config } from "dotenv";

config({ path: ".env" });

const assertString = (value: unknown, key: string) => {
  if (typeof value !== "string" || value.length < 1) {
    throw new Error(`invalid .env: ${key} missing`);
  }
  return value;
};

const env = {
  milesAccountEmail: assertString(
    process.env.MILES_ACCOUNT_EMAIL,
    "MILES_ACCOUNT_EMAIL",
  ),
  milesAccountPassword: assertString(
    process.env.MILES_ACCOUNT_PASSWORD,
    "MILES_ACCOUNT_PASSWORD",
  ),
} as const;

export default env;
