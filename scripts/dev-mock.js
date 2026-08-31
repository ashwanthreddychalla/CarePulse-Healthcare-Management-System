#!/usr/bin/env node
/**
 * Start the Next.js dev server with USE_MOCK_APPWRITE=true
 * This enables the in-memory Appwrite mock for E2E testing.
 */
process.env.USE_MOCK_APPWRITE = "true";

const { spawn } = require("child_process");
const nextBin = require.resolve("next/dist/bin/next");

const child = spawn(process.execPath, [nextBin, "dev"], {
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code) => process.exit(code));
