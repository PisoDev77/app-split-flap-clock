import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { resolve } from 'path'

/**
 * ## Vite 설정
 * 
 * PWA 지원과 Vue 3 개발을 위한 **Vite 빌드 도구** 설정
 * 
 * ### 기능
 * - Vue 3 SFC 지원
 * - PWA 매니페스트 및 서비스 워커 생성
 * - TypeScript 경로 별칭 설정
 * 
 * @since 1.0.0
 */
export default defineConfig({
  publicDir: 'public', // public 폴더의 모든 파일을 dist로 복사
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.png', '.well-known/*'],
      manifest: false, // 별도 manifest.json 사용
      workbox: {
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        navigateFallback: 'index.html'
      }
    }),
    viteStaticCopy({
      targets: [
        {
          src: 'public/.well-known',
          dest: ''
        }
      ]
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  build: {
    // 청크 크기 최적화
    rollupOptions: {
      output: {
        manualChunks: {
          // Vue 관련 라이브러리
          'vue-vendor': ['vue', 'vue-router'],
          // Ant Design Vue 분리
          'ant-design': ['ant-design-vue'],
          // 유틸리티 라이브러리
          'utils': ['dayjs']
        }
      }
    },
    // 청크 크기 경고 임계값 설정
    chunkSizeWarningLimit: 500,
    // 소스맵 비활성화로 크기 줄임
    sourcemap: false,
    // CSS 코드 분할
    cssCodeSplit: true,
    // 미니파이 최적화
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // 프로덕션에서 console.log 제거
        drop_debugger: true
      }
    }
  },
  server: {
    host: true,
    port: 3000
  }
})