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
  dbHost: assertString(
    process.env.DB_HOST,
    "DB_HOST",
  ),
  dbPort: (process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432),
  dbUser: assertString(
    process.env.DB_USER,
    "DB_USER",
  ),
  dbPassword: assertString(
    process.env.DB_PASSWORD,
    "DB_PASSWORD",
  ),
  dbName: assertString(
    process.env.DB_NAME,
    "DB_NAME",
  ),
} as const;

export default env;
