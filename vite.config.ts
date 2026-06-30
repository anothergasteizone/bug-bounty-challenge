/// <reference types="vitest/config" />
import { defineConfig, configDefaults } from "vitest/config";
import react from "@vitejs/plugin-react";
import { visualizer } from 'rollup-plugin-visualizer'

const analyze = process.env.ANALYZE === "true";

export default defineConfig({
    plugins: [
        react(),
        analyze &&
            visualizer({
                open: true,
                gzipSize: true,
                brotliSize: true,
                sourcemap: true,
                filename: 'build/stats.html'
            })
    ],
    server: {
        port: 3000,
        open: true
    },
    build: {
        outDir: "build",
        // Sourcemaps only when analyzing, so stats.html reflects the minified
        // bundle sizes (they are not emitted in a normal build).
        sourcemap: analyze
    },
    test: {
        globals: true,
        environment: "jsdom",
        setupFiles: "./src/test/setup.ts",
        // Playwright specs live in e2e/ and use `@playwright/test`; keep Vitest
        // from collecting them (its default include matches *.spec.ts).
        exclude: [...configDefaults.exclude, "e2e/**"]
    }
});
