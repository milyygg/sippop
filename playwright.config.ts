import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  timeout: 60000,
  fullyParallel: false,
  use: {
    baseURL: process.env.E2E_BASE_URL || "http://127.0.0.1:5173",
    launchOptions: {
      executablePath:
        "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    },
    headless: true,
  },
  reporter: "list",
});
