import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    testTimeout: 120 * 1000,
    hookTimeout: 120 * 1000,
    fileParallelism: false,
    maxConcurrency: 1,
  },
});
