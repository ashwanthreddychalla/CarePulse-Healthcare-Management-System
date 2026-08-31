/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/testing/backend"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    // Catch @/lib/appwrite.config (used in imports with @ alias)
    "^@/lib/appwrite\\.config$": "<rootDir>/lib/appwrite.config.testing",
    "^@/lib/appwrite\\.config\\.(ts|tsx|js)$": "<rootDir>/lib/appwrite.config.testing",
    // Catch ../appwrite.config (used in server actions with relative imports)
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
