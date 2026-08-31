/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/testing/api-testing"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^@/lib/appwrite\\.config$": "<rootDir>/lib/appwrite.config.testing",
    "^@/lib/appwrite\\.config\\.(ts|tsx|js)$": "<rootDir>/lib/appwrite.config.testing",
    "^\\.\\./appwrite\\.config$": "<rootDir>/lib/appwrite.config.testing",
    "^\\.\\.\\./appwrite\\.config$": "<rootDir>/lib/appwrite.config.testing",
  },
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
      },
    ],
  },
  transformIgnorePatterns: [
    "/node_modules/(?!node-appwrite)",
  ],
  testMatch: ["**/*.test.ts", "**/*.test.tsx"],
};
