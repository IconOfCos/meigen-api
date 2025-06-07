/**
 * データバリデーション機能
 * 
 * 名言データの整合性チェック、バリデーション機能、およびデータ品質管理機能を提供します。
 * Quote interfaceに準拠したデータバリデーションとエラーレポート機能を実装しています。
 */

import type { Quote } from '../models/quote.js';

/**
 * バリデーション結果の型定義
 */
export interface ValidationResult {
  /** バリデーションが成功したかどうか */
  isValid: boolean;
  /** バリデーションエラーの配列 */
  errors: ValidationError[];
  /** バリデーション済みのデータ（成功時のみ） */
  data?: Quote | Quote[];
}

/**
 * バリデーションエラーのカスタムクラス
 */
export class ValidationError extends Error {
  constructor(
    public readonly field: string,
    public readonly value: any,
    public readonly reason: string
  ) {
    super(`Validation failed for field '${field}': ${reason}`);
    this.name = 'ValidationError';
  }
}

/**
 * データ整合性レポートの型定義
 */
export interface DataIntegrityReport {
  /** 総名言数 */
  totalQuotes: number;
  /** 有効な名言数 */
  validQuotes: number;
  /** 無効な名言数 */
  invalidQuotes: number;
  /** カテゴリ別分布 */
  categoryDistribution: Record<string, number>;
  /** 作者別分布 */
  authorDistribution: Record<string, number>;
  /** 重複ID配列 */
  duplicateIds: number[];
  /** 欠損フィールド配列 */
  missingFields: string[];
  /** データ品質スコア（0-100） */
  qualityScore: number;
}

/**
 * 許可されたカテゴリの定数配列
 */
const ALLOWED_CATEGORIES = ['人生', '成功', '愛', '友情', '勇気'] as const;

/**
 * 単一のQuoteオブジェクトをバリデーションする
 * @param data - 検証対象のデータ
 * @returns ValidationResult バリデーション結果
 */
export function validateQuote(data: any): ValidationResult {
  const errors: ValidationError[] = [];

  // null/undefined チェック
  if (data == null) {
    errors.push(new ValidationError('quote', data, 'Quote object cannot be null or undefined'));
    return { isValid: false, errors };
  }

  // オブジェクト型チェック
  if (typeof data !== 'object') {
    errors.push(new ValidationError('quote', data, 'Quote must be an object'));
    return { isValid: false, errors };
  }

  // ID検証
  if (typeof data.id !== 'number') {
    errors.push(new ValidationError('id', data.id, 'ID must be a number'));
  } else if (!Number.isInteger(data.id) || data.id <= 0) {
    errors.push(new ValidationError('id', data.id, 'ID must be a positive integer'));
  }

  // テキスト検証
  if (typeof data.text !== 'string') {
    errors.push(new ValidationError('text', data.text, 'Text must be a string'));
  } else if (data.text.trim().length === 0) {
    errors.push(new ValidationError('text', data.text, 'Text cannot be empty'));
  } else if (!containsJapaneseCharacters(data.text)) {
    errors.push(new ValidationError('text', data.text, 'Text must contain Japanese characters'));
  }

  // 作者検証
  if (typeof data.author !== 'string') {
    errors.push(new ValidationError('author', data.author, 'Author must be a string'));
  } else if (data.author.trim().length === 0) {
    errors.push(new ValidationError('author', data.author, 'Author cannot be empty'));
  }

  // カテゴリ検証
  if (typeof data.category !== 'string') {
    errors.push(new ValidationError('category', data.category, 'Category must be a string'));
  } else if (!ALLOWED_CATEGORIES.includes(data.category as any)) {
    errors.push(new ValidationError(
      'category', 
      data.category, 
      `Category must be one of: ${ALLOWED_CATEGORIES.join(', ')}`
    ));
  }

  // 作成日時検証
  if (typeof data.createdAt !== 'string') {
    errors.push(new ValidationError('createdAt', data.createdAt, 'CreatedAt must be a string'));
  } else if (!isValidISO8601(data.createdAt)) {
    errors.push(new ValidationError('createdAt', data.createdAt, 'CreatedAt must be valid ISO 8601 format'));
  }

  // タグ検証（オプショナル）
  if (data.tags !== undefined) {
    if (!Array.isArray(data.tags)) {
      errors.push(new ValidationError('tags', data.tags, 'Tags must be an array if provided'));
    } else {
      for (let i = 0; i < data.tags.length; i++) {
        if (typeof data.tags[i] !== 'string') {
          errors.push(new ValidationError(`tags[${i}]`, data.tags[i], 'Each tag must be a string'));
        }
      }
    }
  }

  const isValid = errors.length === 0;
  return {
    isValid,
    errors,
    data: isValid ? data as Quote : undefined
  };
}

/**
 * 複数のQuoteオブジェクトをバリデーションする
 * @param data - 検証対象のデータ配列
 * @returns ValidationResult バリデーション結果
 */
export function validateQuotes(data: any): ValidationResult {
  const errors: ValidationError[] = [];

  // 配列チェック
  if (!Array.isArray(data)) {
    errors.push(new ValidationError('quotes', data, 'Data must be an array'));
    return { isValid: false, errors };
  }

  const validQuotes: Quote[] = [];
  
  // 各Quote要素のバリデーション
  for (let i = 0; i < data.length; i++) {
    const result = validateQuote(data[i]);
    if (!result.isValid) {
      // エラーにインデックス情報を付加
      result.errors.forEach(error => {
        errors.push(new ValidationError(
          `quotes[${i}].${error.field}`,
          error.value,
          error.reason
        ));
      });
    } else if (result.data) {
      validQuotes.push(result.data as Quote);
    }
  }

  const isValid = errors.length === 0;
  return {
    isValid,
    errors,
    data: isValid ? validQuotes : undefined
  };
}

/**
 * データ整合性をチェックし、レポートを生成する
 * @param quotes - チェック対象のQuote配列
 * @returns DataIntegrityReport 整合性レポート
 */
export function checkDataIntegrity(quotes: Quote[]): DataIntegrityReport {
  const categoryDistribution: Record<string, number> = {};
  const authorDistribution: Record<string, number> = {};
  const seenIds = new Set<number>();
  const duplicateIds: number[] = [];
  const missingFields: string[] = [];

  let validQuotes = 0;
  let invalidQuotes = 0;

  // 各Quoteを分析
  for (const quote of quotes) {
    const validation = validateQuote(quote);
    
    if (validation.isValid) {
      validQuotes++;
      
      // ID重複チェック
      if (seenIds.has(quote.id)) {
        duplicateIds.push(quote.id);
      } else {
        seenIds.add(quote.id);
      }

      // カテゴリ分布
      categoryDistribution[quote.category] = (categoryDistribution[quote.category] || 0) + 1;
      
      // 作者分布
      authorDistribution[quote.author] = (authorDistribution[quote.author] || 0) + 1;
    } else {
      invalidQuotes++;
      
      // 欠損フィールドの収集
      validation.errors.forEach(error => {
        if (!missingFields.includes(error.field)) {
          missingFields.push(error.field);
        }
      });
    }
  }

  // データ品質スコアの計算（0-100）
  const totalQuotes = quotes.length;
  let qualityScore = 0;
  
  if (totalQuotes > 0) {
    const validRatio = validQuotes / totalQuotes;
    const duplicateRatio = duplicateIds.length / totalQuotes;
    qualityScore = Math.round((validRatio * 0.8 + (1 - duplicateRatio) * 0.2) * 100);
  }

  return {
    totalQuotes,
    validQuotes,
    invalidQuotes,
    categoryDistribution,
    authorDistribution,
    duplicateIds,
    missingFields,
    qualityScore
  };
}

/**
 * 文字列に日本語文字が含まれているかチェックする
 * @param text - チェック対象の文字列
 * @returns boolean 日本語文字が含まれている場合true
 */
function containsJapaneseCharacters(text: string): boolean {
  // ひらがな、カタカナ、漢字のUnicodeレンジをチェック
  const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\u3400-\u4DBF]/;
  return japaneseRegex.test(text);
}

/**
 * ISO 8601形式の日時文字列かどうかをチェックする
 * @param dateString - チェック対象の日時文字列
 * @returns boolean 有効なISO 8601形式の場合true
 */
function isValidISO8601(dateString: string): boolean {
  try {
    const date = new Date(dateString);
    return date.toISOString() === dateString;
  } catch {
    return false;
  }
}