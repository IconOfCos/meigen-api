---
task_id: "T01_S01_Vitest_Setup"
sprint: "S01_M001_TDD_Foundation"
milestone: "M001_TDD_Foundation"
status: "not_started"
complexity: "TBD"
estimated_hours: "4-6"
assignee: ""
created_date: "2025-06-07"
last_updated: ""
dependencies: []
tags: ["vitest", "testing", "setup", "tdd", "configuration"]
---

# T01_S01_Vitest_Setup: Vitest設定とテスト実行環境のセットアップ

## 概要
このタスクでは、Hono + TypeScript プロジェクトにVitestを設定し、テスト駆動開発（TDD）のための基盤を構築します。既存のプロジェクト構成（ES Modules、TypeScript、Biome）との統合を重視したセットアップを行います。

## 目的
- Vitestのテスト実行環境をセットアップ
- TypeScript + ES Modules + Honoとの統合設定
- package.jsonにテスト関連スクリプトを追加
- 基本的なテスト構造の確立
- テスト実行の動作検証

## 現在のプロジェクト状況分析

### 既存の設定
- **パッケージタイプ**: ES Modules (`"type": "module"`)
- **Vitestバージョン**: v3.2.2 (devDependenciesに既存)
- **TypeScript設定**: target ESNext, module NodeNext
- **フレームワーク**: Hono v4.7.11 with @hono/node-server
- **開発ツール**: Biome (lint, format, check)
- **ビルドツール**: tsc, tsx (開発サーバー)

### 不足している要素
- vitest.config.ts設定ファイル
- package.jsonのテストスクリプト
- テストディレクトリ構造
- テスト実行の動作確認

## 受け入れ基準

### 必須要件
1. **設定ファイル作成**
   - [ ] vitest.config.tsファイルが作成されている
   - [ ] TypeScript + ES Modulesの設定が適切に行われている
   - [ ] Honoアプリケーションのテストに対応した設定になっている

2. **package.jsonスクリプト**
   - [ ] `npm test` でVitestが実行される
   - [ ] `npm run test:watch` でwatch モードが動作する
   - [ ] `npm run test:coverage` でカバレッジレポートが生成される
   - [ ] `npm run test:ui` でVitestのUIが起動する

3. **テスト構造**
   - [ ] testsディレクトリまたはsrc内テストファイルの基本構造が確立されている
   - [ ] 基本的なサンプルテストが作成されている
   - [ ] Honoアプリケーションのテスト例が含まれている

4. **動作検証**
   - [ ] すべてのテストスクリプトが正常に実行される
   - [ ] サンプルテストがパスする
   - [ ] エラーメッセージが適切に表示される

### オプション要件
- [ ] TypeScriptの型チェックがテスト実行時に行われる
- [ ] Biomeとの統合（テストファイルのlint/format）
- [ ] GitHub Actionsでのテスト実行準備

## 技術ガイダンス

### Vitest設定のキーポイント
1. **ES Modules対応**
   - package.jsonの `"type": "module"` 設定との整合性
   - import/export文の適切な処理

2. **TypeScript統合**
   - tsconfig.jsonとの連携
   - 型チェック設定の最適化
   - JSX設定（Hono/jsx）の考慮

3. **Hono特有の設定**
   - Web標準APIのモック設定
   - Node.js環境でのHTTPテスト対応
   - Requestオブジェクトのテスト対応

### Package.json スクリプト構造
推奨するテストスクリプトの体系：
- 基本実行（`test`）
- 開発時ウォッチ（`test:watch`）
- カバレッジ生成（`test:coverage`）
- UI起動（`test:ui`）
- CI用実行（`test:ci`）

### 統合ポイント
1. **既存のTypeScript設定**
   - outDir設定との衝突回避
   - target/module設定の活用

2. **Biome統合**
   - テストファイルのlint/format対象化
   - 既存のbiome.json設定の拡張

3. **開発ワークフロー**
   - 既存のdev, build, startスクリプトとの連携
   - tsxでの開発とVitestテストの同時実行

## 実装手順

### Phase 1: 基本設定
1. vitest.config.tsファイルの作成
2. package.jsonテストスクリプトの追加
3. 基本的なテスト構造の決定

### Phase 2: 統合設定
1. TypeScript設定の調整
2. ES Modules対応の確認
3. Hono特有の設定追加

### Phase 3: サンプル作成
1. 基本的なユニットテストサンプル
2. Honoルートのテストサンプル
3. 各テストタイプの実行確認

### Phase 4: 動作検証
1. 全テストスクリプトの実行テスト
2. エラーハンドリングの確認
3. パフォーマンスの検証

## テスト手法

### 設定検証
- 各テストスクリプトの個別実行
- 異なるテストパターン（pass/fail）での動作確認
- カバレッジレポートの生成確認

### 統合検証
- 既存のbuild, devスクリプトとの並行実行
- Biomeのlint/formatとの連携確認
- TypeScriptコンパイレーションとの整合性確認

### パフォーマンス検証
- テスト実行速度の測定
- ウォッチモードの応答性確認
- メモリ使用量の監視

## 参考情報

### 公式ドキュメント
- Vitest Configuration Guide
- Vitest TypeScript Integration
- Hono Testing Documentation

### 設定パターン参考
- ES Modules + TypeScript + Vitest
- Hono + Vitest統合例
- Node.js環境でのWebAPIテスト

## 注意事項
- 既存のpackage.jsonスクリプトとの名前衝突を避ける
- ES Modules設定との整合性を必ず確認する
- Honoの非同期処理とVitestの互換性に注意
- TypeScriptの型チェックパフォーマンスを考慮する

## 完了条件
このタスクは以下のすべてが満たされた時点で完了とする：
1. すべての受け入れ基準（必須要件）がクリアされている
2. サンプルテストが正常に実行される
3. エラーケースも含めて動作が確認されている
4. 次のスプリントでのTDD開発に移行可能な状態になっている