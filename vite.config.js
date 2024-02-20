import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import inject from '@rollup/plugin-inject'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        dts()
    ],

    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },

    build: {
        target: ['es2015', 'chrome100', 'safari13'],
        cssTarget: ['chrome52'],
        rollupOptions: {
            plugins:[inject({Buffer: ['Buffer', 'Buffer']})]
        },
        lib: {
            entry: './src/index.ts',
            name: 'MyLib',
            fileName: 'index',
            formats: ['es', 'cjs', 'umd'],
        },
        outDir: 'dist',
        minify: false,
    },
})
