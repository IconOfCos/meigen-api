---
task_id: T05_S02_Data_Validation
sprint: S02_M001_Data_Core
milestone: M001_API_FOUNDATION
status: not_started
complexity: Low
estimated_hours: 3-4
assignee: null
dependencies: [T02_S02_Data_Access_Layer]
tags: [validation, data-integrity, typescript, error-handling]
---

# T05_S02_Data_Validation

## 説明

このタスクでは、名言データの整合性チェックとバリデーション機能を実装します。データアクセス層に統合されたバリデーション機能により、不正なデータの検出、データ品質の保証、およびランタイムエラーの予防を行い、アプリケーション全体の安定性を向上させます。

## 目標

- Quote interfaceに準拠したデータバリデーション実装
- データ整合性チェック機能の実装
- 不正データの検出とエラーレポート機能
- データ品質メトリクスの提供
- カテゴリ・作者データの一貫性検証
- 将来のデータ拡張に対応できるバリデーション基盤構築

## 受け入れ基準

- [ ] src/data/validation.ts にバリデーション関数が実装されている
- [ ] validateQuote(quote: any): Quote 関数が実装されている
- [ ] validateQuotes(quotes: any[]): Quote[] 関数が実装されている
- [ ] データ整合性チェック機能が実装されている
- [ ] 不正データに対する詳細なエラーメッセージが提供される
- [ ] バリデーションテストが実装され通過する
- [ ] データアクセス層（loadQuotes）にバリデーションが統合されている
- [ ] TypeScript strict modeでコンパイルエラーが発生しない

## 技術ガイダンス

### 統合ポイント

**データアクセス層との統合:**
- src/data/index.ts の loadQuotes() 関数内でバリデーション実行
- バリデーションエラー時の適切なエラーハンドリング
- 部分的なデータ読み込み失敗に対する戦略

**型定義との統合:**
- src/models/index.ts の Quote interface を厳密に適用
- カスタムバリデーションエラー型の定義
- TypeScript型システムとランタイムバリデーションの連携

**サービス層との統合:**
- QuoteService でのバリデーション済みデータの利用
- バリデーションエラーのサービス層への伝播
- データ品質メトリクスのサービス層公開

### バリデーション実装パターン

**Quote オブジェクトバリデーション:**
```typescript
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export class ValidationError extends Error {
  constructor(
    public readonly field: string,
    public readonly value: any,
    public readonly reason: string
  ) {
    super(`Validation failed for field '${field}': ${reason}`);
  }
}

export function validateQuote(data: any): ValidationResult
export function validateQuotes(data: any[]): ValidationResult
```

**データ整合性チェック:**
```typescript
export interface DataIntegrityReport {
  totalQuotes: number;
  validQuotes: number;
  invalidQuotes: number;
  categoryDistribution: Record<string, number>;
  authorDistribution: Record<string, number>;
  duplicateIds: number[];
  missingFields: string[];
}

export function checkDataIntegrity(quotes: Quote[]): DataIntegrityReport
```

### バリデーションルール

**必須フィールド検証:**
- id: 正の整数、一意性
- text: 非空文字列、日本語文字含有
- author: 非空文字列
- category: 指定カテゴリからの選択
- createdAt: 有効なISO 8601形式

**データ品質検証:**
- IDの重複検出
- カテゴリ名の有効性（5つの指定カテゴリ）
- 日本語文字エンコーディングの確認
- 作成日時の妥当性検証

**カテゴリ整合性:**
- 許可されたカテゴリ："人生", "成功", "愛", "友情", "勇気"
- カテゴリ名の正確性（空白、大文字小文字）
- 未定義カテゴリの検出

## 実装ノート

### Phase 1: 基本バリデーション実装
- validateQuote() 関数の実装
- 基本的なフィールド存在・型チェック
- ValidationError クラスの実装

### Phase 2: データ整合性チェック実装
- checkDataIntegrity() 関数の実装
- ID重複検出ロジック
- カテゴリ・作者分布の計算

### Phase 3: 高度なバリデーション実装
- 日本語文字エンコーディング検証
- ISO 8601日時形式の厳密チェック
- データ品質スコアの算出

### Phase 4: データアクセス層統合
- loadQuotes() でのバリデーション統合
- バリデーションエラー時の戦略実装
- パフォーマンス最適化

## テスト手法

### 単体テスト

**バリデーション機能テスト:**
- 有効なQuoteオブジェクトのバリデーション成功確認
- 各必須フィールドの欠如に対するエラー確認
- 無効な型に対するエラー確認

**データ整合性テスト:**
- ID重複検出の動作確認
- カテゴリ分布計算の正確性確認
- 不正カテゴリの検出確認

### 統合テスト

**データアクセス層統合:**
- 有効なquotes.jsonでのバリデーション成功確認
- 不正データを含むJSONでのエラーハンドリング確認
- バリデーション結果のサービス層への伝播確認

### エラーハンドリングテスト

**異常系テスト:**
- 必須フィールド欠如時のエラーメッセージ確認
- 型不適合時のエラーメッセージ確認
- 複数エラー同時発生時の処理確認

## 備考

- T02_S02_Data_Access_Layer タスクで実装されるデータアクセス機能に統合
- データ品質の監視とメトリクス収集機能も含む
- 将来のデータ投稿機能時のバリデーション基盤として設計
- バリデーション性能も測定し、大量データでの動作を確認