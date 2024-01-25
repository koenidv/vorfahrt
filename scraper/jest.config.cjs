module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {},
  extensionsToTreatAsEsm: [".ts"],
  moduleFileExtensions: ["ts", "js"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  testPathIgnorePatterns: ["<rootDir>/test/testEnv.ts"]
};
