import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Node.js環境でのテスト実行（HonoサーバーとNode.js APIをテスト）
    environment: 'node',
    
    // テストファイルのパターン設定
    include: ['tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    
    // グローバル設定（describe, it, expect等をインポート不要にする）
    globals: true,
    
    // TypeScript設定
    typecheck: {
      enabled: true,
      tsconfig: './tsconfig.json'
    },
    
    // カバレッジ設定
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'coverage/',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        '**/index.ts' // エクスポートのみのファイル
      ],
      reportsDirectory: './coverage'
    },
    
    // Hono特有の設定: Web標準API対応
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true
      }
    },
    
    // テスト実行設定
    testTimeout: 10000,
    hookTimeout: 10000
  }
});