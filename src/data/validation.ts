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
    public readonly value: unknown,
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
 * @returns Quote バリデーション済みのQuoteオブジェクト
 * @throws ValidationError バリデーションに失敗した場合
 */
export function validateQuote(data: unknown): Quote {
  const errors: ValidationError[] = [];

  // null/undefined チェック
  if (data == null) {
    throw new ValidationError('quote', data, 'Quote object cannot be null or undefined');
  }

  // オブジェクト型チェック
  if (typeof data !== 'object') {
    throw new ValidationError('quote', data, 'Quote must be an object');
  }

  // プロパティアクセスのために型をキャスト
  const obj = data as Record<string, unknown>;

  // ID検証
  if (typeof obj.id !== 'number') {
    errors.push(new ValidationError('id', obj.id, 'ID must be a number'));
  } else if (!Number.isInteger(obj.id) || obj.id <= 0) {
    errors.push(new ValidationError('id', obj.id, 'ID must be a positive integer'));
  }

  // テキスト検証
  if (typeof obj.text !== 'string') {
    errors.push(new ValidationError('text', obj.text, 'Text must be a string'));
  } else if (obj.text.trim().length === 0) {
    errors.push(new ValidationError('text', obj.text, 'Text cannot be empty'));
  } else if (!containsJapaneseCharacters(obj.text)) {
    errors.push(new ValidationError('text', obj.text, 'Text must contain Japanese characters'));
  }

  // 作者検証
  if (typeof obj.author !== 'string') {
    errors.push(new ValidationError('author', obj.author, 'Author must be a string'));
  } else if (obj.author.trim().length === 0) {
    errors.push(new ValidationError('author', obj.author, 'Author cannot be empty'));
  }

  // カテゴリ検証
  if (typeof obj.category !== 'string') {
    errors.push(new ValidationError('category', obj.category, 'Category must be a string'));
  } else if (!(ALLOWED_CATEGORIES as readonly string[]).includes(obj.category)) {
    errors.push(new ValidationError(
      'category', 
      obj.category, 
      `Category must be one of: ${ALLOWED_CATEGORIES.join(', ')}`
    ));
  }

  // 作成日時検証
  if (typeof obj.createdAt !== 'string') {
    errors.push(new ValidationError('createdAt', obj.createdAt, 'CreatedAt must be a string'));
  } else if (!isValidISO8601(obj.createdAt)) {
    errors.push(new ValidationError('createdAt', obj.createdAt, 'CreatedAt must be valid ISO 8601 format'));
  }

  // タグ検証（オプショナル）
  if (obj.tags !== undefined) {
    if (!Array.isArray(obj.tags)) {
      errors.push(new ValidationError('tags', obj.tags, 'Tags must be an array if provided'));
    } else {
      for (let i = 0; i < obj.tags.length; i++) {
        if (typeof obj.tags[i] !== 'string') {
          errors.push(new ValidationError(`tags[${i}]`, obj.tags[i], 'Each tag must be a string'));
        }
      }
    }
  }

  // エラーがある場合は最初のエラーをスロー
  if (errors.length > 0) {
    throw errors[0];
  }

  return data as Quote;
}

/**
 * 複数のQuoteオブジェクトをバリデーションする
 * @param data - 検証対象のデータ配列
 * @returns Quote[] バリデーション済みのQuote配列
 * @throws ValidationError バリデーションに失敗した場合
 */
export function validateQuotes(data: unknown): Quote[] {
  // 配列チェック
  if (!Array.isArray(data)) {
    throw new ValidationError('quotes', data, 'Data must be an array');
  }

  const validQuotes: Quote[] = [];
  
  // 各Quote要素のバリデーション
  for (let i = 0; i < data.length; i++) {
    try {
      const validQuote = validateQuote(data[i]);
      validQuotes.push(validQuote);
    } catch (error) {
      if (error instanceof ValidationError) {
        // エラーにインデックス情報を付加
        throw new ValidationError(
          `quotes[${i}].${error.field}`,
          error.value,
          error.reason
        );
      }
      throw error;
    }
  }

  return validQuotes;
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
    try {
      const validatedQuote = validateQuote(quote);
      validQuotes++;
      
      // ID重複チェック
      if (seenIds.has(validatedQuote.id)) {
        duplicateIds.push(validatedQuote.id);
      } else {
        seenIds.add(validatedQuote.id);
      }

      // カテゴリ分布
      categoryDistribution[validatedQuote.category] = (categoryDistribution[validatedQuote.category] || 0) + 1;
      
      // 作者分布
      authorDistribution[validatedQuote.author] = (authorDistribution[validatedQuote.author] || 0) + 1;
    } catch (error) {
      invalidQuotes++;
      
      // 欠損フィールドの収集
      if (error instanceof ValidationError) {
        if (!missingFields.includes(error.field)) {
          missingFields.push(error.field);
        }
      }
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

/**
 * 単一のQuoteオブジェクトをバリデーションする（ValidationResult返却版）
 * @param data - 検証対象のデータ
 * @returns ValidationResult バリデーション結果
 * @deprecated 後方互換性のために提供。新しいコードではvalidateQuote()を使用してください
 */
export function validateQuoteWithResult(data: unknown): ValidationResult {
  try {
    const validatedQuote = validateQuote(data);
    return {
      isValid: true,
      errors: [],
      data: validatedQuote
    };
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        isValid: false,
        errors: [error],
        data: undefined
      };
    }
    return {
      isValid: false,
      errors: [new ValidationError('unknown', data, 'Unknown validation error')],
      data: undefined
    };
  }
}

/**
 * 複数のQuoteオブジェクトをバリデーションする（ValidationResult返却版）
 * @param data - 検証対象のデータ配列
 * @returns ValidationResult バリデーション結果
 * @deprecated 後方互換性のために提供。新しいコードではvalidateQuotes()を使用してください
 */
export function validateQuotesWithResult(data: unknown): ValidationResult {
  try {
    const validatedQuotes = validateQuotes(data);
    return {
      isValid: true,
      errors: [],
      data: validatedQuotes
    };
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        isValid: false,
        errors: [error],
        data: undefined
      };
    }
    return {
      isValid: false,
      errors: [new ValidationError('unknown', data, 'Unknown validation error')],
      data: undefined
    };
  }
}