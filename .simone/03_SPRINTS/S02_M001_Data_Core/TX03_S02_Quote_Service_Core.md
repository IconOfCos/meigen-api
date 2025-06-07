---
task_id: T03_S02_Quote_Service_Core
sprint: S02_M001_Data_Core
milestone: M001_API_FOUNDATION
status: completed
complexity: Medium
estimated_hours: 5-6
assignee: null
dependencies: [T02_S02_Data_Access_Layer]
tags: [service, business-logic, random, search, typescript]
updated: 2025-06-07 06:32
---

# T03_S02_Quote_Service_Core

## 説明

このタスクでは、名言APIのコアビジネスロジックを担うQuoteServiceを実装します。データアクセス層を利用して、ランダム名言選択、ID検索、基本的なデータ操作機能を提供し、API層とデータ層の架け橋となるサービス層を構築します。

## 目標

- QuoteServiceクラスの基本実装
- ランダム名言選択機能の実装
- ID指定による名言取得機能
- 全名言取得機能（ページネーション対応準備）
- 堅牢なエラーハンドリングとサービス層例外管理
- 将来のAPI層統合に最適化されたインターフェース設計

## 受け入れ基準

- [x] src/services/quoteService.ts にQuoteServiceクラスが実装されている
- [x] getRandomQuote() メソッドがランダムな名言を返す
- [x] getQuoteById(id: number) メソッドがID指定で名言を取得する
- [x] getAllQuotes() メソッドが全ての名言を取得する
- [x] 適切なエラーハンドリング（QuoteNotFoundError等）が実装されている
- [x] src/services/index.ts でQuoteServiceがエクスポートされている
- [x] tests/services/quote-service.test.ts でテストが実装され通過する
- [x] TypeScript strict modeでコンパイルエラーが発生しない

## 技術ガイダンス

### 統合ポイント

**データアクセス層との統合:**
- src/data/index.ts の loadQuotes() 関数を利用
- DataAccessError の適切なハンドリング
- メモリキャッシュの効果的な活用

**型定義との統合:**
- src/models/index.ts の Quote interface 使用
- APIResponse<T> 型を考慮したレスポンス設計
- カスタムエラー型の定義と使用

**将来のAPI層統合:**
- src/routes/ での使用を前提としたメソッド設計
- HTTP status codeに対応するエラー分類
- ページネーション機能への拡張準備

### サービス設計パターン

**QuoteServiceクラス設計:**
```typescript
export class QuoteService {
  private quotes: Quote[] = [];
  private isInitialized: boolean = false;

  async initialize(): Promise<void>
  async getRandomQuote(): Promise<Quote>
  async getQuoteById(id: number): Promise<Quote>
  async getAllQuotes(): Promise<Quote[]>
  getQuoteCount(): number
}
```

**エラーハンドリング:**
```typescript
export class QuoteNotFoundError extends Error {
  constructor(id: number) {
    super(`Quote with id ${id} not found`);
    this.name = 'QuoteNotFoundError';
  }
}

export class QuoteServiceError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'QuoteServiceError';
  }
}
```

### ビジネスロジック実装

**ランダム選択アルゴリズム:**
- Math.random() を使用した真のランダム選択
- 空配列に対する適切なエラーハンドリング
- 連続した同じ名言の回避（オプション機能）

**ID検索ロジック:**
- 効率的な線形検索またはMap-based検索
- 存在しないIDに対するQuoteNotFoundError
- 無効なID値（負数、0、非整数）の検証

**データ初期化:**
- 遅延初期化（Lazy Loading）パターン
- 初期化エラーの適切なハンドリング
- 再初期化機能（テスト用）

## 実装ノート

### Phase 1: 基本クラス構造実装
- QuoteServiceクラスの基本構造
- 初期化メソッドとデータ読み込み
- 基本的なエラーハンドリング

### Phase 2: コア機能実装
- getRandomQuote() メソッド実装
- getQuoteById() メソッド実装
- getAllQuotes() メソッド実装

### Phase 3: エラーハンドリング強化
- カスタムエラークラス実装
- エラーメッセージの国際化準備
- ログ出力機能（オプション）

### Phase 4: テスト実装と最適化
- 単体テストの実装
- パフォーマンステストの実装
- エッジケーステストの実装

## テスト手法

### 単体テスト

**正常系テスト:**
- ランダム名言取得の動作確認
- ID指定名言取得の動作確認
- 全名言取得の動作確認

**異常系テスト:**
- 存在しないID指定時のエラーハンドリング
- データ未初期化時のエラーハンドリング
- 空データセット時のエラーハンドリング

**境界値テスト:**
- 最小ID（1）の検索
- 最大IDの検索
- 無効なID値（0、負数、非整数）の処理

### 統合テスト

**データアクセス層統合:**
- 実際のquotes.jsonとの連携テスト
- データアクセスエラー時の動作確認

**パフォーマンステスト:**
- ランダム選択の実行時間測定
- 大量データでの検索性能確認

## Output Log

[2025-06-07 06:33]: QuoteServiceクラスの基本実装完了 - 初期化、ランダム取得、ID検索、全件取得機能を実装
[2025-06-07 06:33]: カスタムエラークラス実装完了 - QuoteNotFoundError、QuoteServiceErrorの実装
[2025-06-07 06:34]: サービスエクスポート設定完了 - src/services/index.tsでQuoteServiceをエクスポート
[2025-06-07 06:34]: 包括的テストスイート実装完了 - 19テストケース、正常系・異常系・境界値・パフォーマンステスト
[2025-06-07 06:35]: TypeScriptコンパイル成功 - strict modeでエラーなし
[2025-06-07 06:35]: 全テスト実行成功 - 51テストケース全て通過（19個のQuoteService専用テスト含む）
[2025-06-07 06:38]: Code Review - PASS
Result: **PASS** 実装は仕様に完全に準拠しており、品質基準を満たしている。
**Scope:** T03_S02_Quote_Service_Core タスクの全実装範囲 - QuoteServiceクラス、エラーハンドリング、テストスイート、サービスエクスポート設定
**Findings:** 仕様との相違点なし。全ての受け入れ基準が満たされ、追加の品質改善も含まれている。
**Summary:** 実装品質は優秀。仕様要求を完全に満たし、エラーハンドリング、ランダム選択、ID検索、全件取得機能が適切に実装されている。テストスイートは包括的で19テストケースが全て通過。TypeScriptコンパイルもエラーなし。
**Recommendation:** この実装は本番環境での使用に適している。次の依存タスク T04_S02_Search_Filter_Features に進行可能。

## 備考

- T02_S02_Data_Access_Layer タスクで実装されるデータアクセス層が前提
- T04_S02_Search_Filter_Features タスクでフィルタリング機能が追加される
- 将来のS03スプリントでAPI層と統合される予定
- ランダム選択の品質（真の乱数性）も検証する