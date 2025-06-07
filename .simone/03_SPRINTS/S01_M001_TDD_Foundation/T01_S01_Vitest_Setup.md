---
task_id: T01_S01_Vitest_Setup
sprint: S01_M001_TDD_Foundation
milestone: M001_API_FOUNDATION
status: not_started
complexity: Medium
estimated_hours: 4-6
assignee: null
dependencies: []
tags: [setup, testing, vitest, configuration]
---

# T01_S01_Vitest_Setup

## 説明

このタスクでは、プロジェクト全体のTDD開発基盤となるVitestテストフレームワークの設定と実行環境を構築します。既存のHono + TypeScript環境に適切に統合し、後続のスプリントでのテスト駆動開発を可能にします。

## 目標

- Vitestテストフレームワークの完全な設定と構成
- package.jsonのテスト実行スクリプトの追加
- TypeScript + ES Modulesに対応したテスト環境の確立
- 基本的なテストケースの実行確認

## 受け入れ基準

- [ ] vitest.config.tsファイルが作成され、TypeScript/ES Modules環境に適切に設定されている
- [ ] package.jsonに`test`、`test:watch`、`test:coverage`スクリプトが追加されている
- [ ] `npm test`コマンドが正常に実行される
- [ ] 基本的なテストファイルを作成してテスト実行が成功する
- [ ] TypeScriptコンパイルエラーが発生しない
- [ ] Biome lintとの統合に問題がない

## 技術ガイダンス

### 主要な統合ポイント

**ES Modules対応:**
- プロジェクトは`"type": "module"`設定済み
- vitest.config.tsはESM形式で記述する必要
- importパスの拡張子に注意

**TypeScript統合:**
- tsconfig.jsonのcompilerOptions活用
- `target: "ESNext"`、`module: "NodeNext"`との整合性
- 型安全性を保持したテスト環境

**Hono統合:**
- @hono/node-serverのテスト環境設定
- HTTPリクエスト/レスポンステストの基盤
- ミドルウェア・ルートハンドラーのテスト対応

**既存環境との統合:**
- Biome（lint/format）との協調
- 既存のnpmスクリプトとの整合性
- tsconfig.jsonの設定活用

### 設定要素

**vitest.config.ts必須設定:**
- test environmentの設定（Node.js）
- TypeScript transform設定
- テストファイル検出パターン
- カバレッジレポート設定

**package.jsonスクリプト:**
- test: 単発テスト実行
- test:watch: 監視モード
- test:coverage: カバレッジ付きテスト

## 実装ノート

### Phase 1: 設定ファイル作成
- vitest.config.tsの基本設定作成
- TypeScript、ES Modules環境に最適化
- 将来のカバレッジ測定を考慮した設定

### Phase 2: package.jsonスクリプト追加
- テスト関連スクリプトの追加
- 既存のdev、buildスクリプトとの協調
- 開発効率を考慮したwatch設定

### Phase 3: 基本テスト構造構築
- testsディレクトリ構造の設計
- サンプルテストファイルの作成
- テスト実行の検証

### Phase 4: 統合検証
- 全体的なテスト実行の確認
- TypeScriptコンパイルの検証
- 他のツール（Biome）との統合確認

## テスト手法

### 設定検証
- vitest.config.tsの構文・設定値検証
- package.jsonスクリプトの動作確認

### 統合検証  
- TypeScriptとVitestの統合検証
- ES Modulesでのテスト実行確認

### パフォーマンス検証
- テスト実行速度の確認
- 監視モードの動作確認

## 備考

- 既存のnode_modulesにVitest 3.2.2がインストール済み
- プロジェクトはES Modules設定済み（`"type": "module"`）
- TypeScript 5.8.3、Hono v4.7.11との統合が必要
- 後続タスク（T02型定義、T03プロジェクト構造）の基盤となる