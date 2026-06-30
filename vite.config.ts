import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
    plugins: [
        react(),
        process.env.ANALYZE === "true" &&
            visualizer({
                open: true,
                gzipSize: true,
                brotliSize: true,
                filename: 'dist/stats.html'
            })
    ],
    server: {
        port: 3000,
        open: true
    },
    build: {
        outDir: "build"
    }
});
