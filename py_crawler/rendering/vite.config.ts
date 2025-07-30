import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
    ],
    // 根据需要配置其他选项，例如代理等
    // server: {
    //   proxy: {
    //     '/api': {
    //       target: 'http://localhost:你的后端端口',
    //       changeOrigin: true,
    //       rewrite: (path) => path.replace(/^\/api/, ''),
    //     },
    //   },
    // },
}) 