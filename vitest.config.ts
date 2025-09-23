import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // @ts-expect-error - Vite plugin compatibility issue
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      include: [
        "app/**/*.{js,jsx,ts,tsx}",
        "components/**/*.{js,jsx,ts,tsx}",
        "lib/**/*.{js,jsx,ts,tsx}",
        "config/**/*.{js,jsx,ts,tsx}",
        "stores/**/*.{js,jsx,ts,tsx}",
      ],
      exclude: [
        "**/*.d.ts",
        "**/node_modules/**",
        "**/.next/**",
        "**/__tests__/**",
        "**/test/**",
        "**/tests/**",
      ],
      thresholds: {
        global: {
          branches: 3,
          functions: 2,
          lines: 2,
          statements: 2,
        },
      },
    },
    exclude: ["**/node_modules/**", "**/.next/**", "**/dist/**"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
