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

/**
 * MockQuoteDataの型ガード関数
 * @param obj - 検証対象のオブジェクト
 * @returns obj is MockQuoteData
 */
export function isMockQuoteData(obj: unknown): obj is MockQuoteData {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  
  const data = obj as Record<string, unknown>;
  
  return (
    Array.isArray(data.quotes) &&
    Array.isArray(data.invalidQuotes)
  );
}

/**
 * TestQuoteDataの型ガード関数
 * @param obj - 検証対象のオブジェクト
 * @returns obj is TestQuoteData
 */
export function isTestQuoteData(obj: unknown): obj is TestQuoteData {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  
  const data = obj as Record<string, unknown>;
  
  return (
    typeof data.valid === 'object' &&
    data.valid !== null &&
    typeof data.invalid === 'object' &&
    data.invalid !== null
  );
}

/**
 * MockQuoteDataを作成するファクトリ関数
 * @param validQuotes - 有効な名言データ
 * @param invalidQuotes - 無効なデータ
 * @returns MockQuoteData
 */
export function createMockQuoteData(
  validQuotes: Quote[] = [],
  invalidQuotes: unknown[] = []
): MockQuoteData {
  return {
    quotes: validQuotes,
    invalidQuotes: invalidQuotes
  };
}

/**
 * TestQuoteDataを作成するファクトリ関数
 * @param validQuote - 有効な名言データ
 * @param missingRequired - 必須フィールドが欠けているデータ
 * @param wrongType - 型が間違っているデータ
 * @param empty - 空のデータ
 * @returns TestQuoteData
 */
export function createTestQuoteData(
  validQuote: Quote,
  missingRequired: Partial<Quote> = {},
  wrongType: Record<string, unknown> = {},
  empty: Record<string, never> = {}
): TestQuoteData {
  return {
    valid: validQuote,
    invalid: {
      missingRequired,
      wrongType,
      empty
    }
  };
}