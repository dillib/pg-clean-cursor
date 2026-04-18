import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["tests/unit/**/*.test.ts"],
    exclude: ["tests/e2e/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["server/**/*.ts"],
      exclude: ["server/vite.ts", "server/index.ts", "**/*.d.ts"],
    },
    setupFiles: ["./tests/setup.ts"],
    testTimeout: 15_000,
  },
  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "shared"),
    },
  },
});
