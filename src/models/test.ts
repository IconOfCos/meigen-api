/**
 * テスト関連の型定義
 * 
 * モックデータ、テストケース用のデータ型定義
 */

import type { Quote } from './quote.js';

/**
 * テスト用のモックデータ型
 */
export interface MockQuoteData {
  /** モック名言データ */
  quotes: Quote[];
  /** テスト用の無効なデータ */
  invalidQuotes: unknown[];
}

/**
 * テストケース用のデータ型
 */
export interface TestQuoteData {
  /** 有効なテストデータ */
  valid: Quote;
  /** 無効なテストデータ */
  invalid: {
    /** 必須フィールドが欠けているデータ */
    missingRequired: Partial<Quote>;
    /** 型が間違っているデータ */
    wrongType: Record<string, unknown>;
    /** 空のデータ */
    empty: Record<string, never>;
  };
}