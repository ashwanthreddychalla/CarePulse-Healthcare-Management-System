/**
 * @type {import('ts-jest').JestConfigWithTsJest}
 */
module.exports = {
  testEnvironment: "jsdom",
  setupFiles: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^@/lib/appwrite\\.config$": "<rootDir>/lib/appwrite.config.testing",
    "^@/lib/appwrite\\.config\\.(ts|tsx|js)$": "<rootDir>/lib/appwrite.config.testing",
    "^\\.\\./appwrite\\.config$": "<rootDir>/lib/appwrite.config.testing",
    "^\\.\\./appwrite\\.config\\.(ts|tsx|js)$": "<rootDir>/lib/appwrite.config.testing",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "^react-phone-number-input/style.css$": "identity-obj-proxy",
    "^react-datepicker/dist/react-datepicker.css$": "identity-obj-proxy",
    "^next/navigation$": "<rootDir>/__mocks__/next/navigation.js",
    "^next/image$": "<rootDir>/__mocks__/next/image.js",
    "^next/link$": "<rootDir>/__mocks__/next/link.js",
  },
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: "<rootDir>/tsconfig.jest.json",
      },
    ],
  },
  transformIgnorePatterns: [
    "/node_modules/(?!react-phone-number-input|libphonenumber-js|cmdk|@radix-ui|react-datepicker|react-dropzone|input-otp|next-themes|class-variance-authority|clsx|tailwind-merge|lucide-react|@tanstack)",
  ],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/testing/backend/",
    "/testing/api-testing/",
    "/testing/e2e/",
  ],
  collectCoverageFrom: [
    "components/**/*.{ts,tsx}",
    "lib/**/*.{ts,tsx}",
    "app/**/*.{ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
  ],
};
