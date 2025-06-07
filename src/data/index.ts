/**
 * データアクセス層
 * 
 * JSONファイルからの名言データ読み込み、基本的なデータ操作機能、
 * およびエラーハンドリングを含む堅牢なデータアクセス基盤を提供します。
 */

import { promises as fs } from 'fs';
import path from 'path';
import type { Quote } from '../models/quote.js';

/**
 * データアクセスエラーのカスタムクラス
 */
export class DataAccessError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'DataAccessError';
  }
}

/**
 * メモリキャッシュの管理
 */
let quotesCache: Quote[] | null = null;

/**
 * quotes.jsonファイルからデータを読み込み、Quote[]を返す
 * @returns Promise<Quote[]> 名言データの配列
 * @throws DataAccessError ファイル読み込みやJSON解析に失敗した場合
 */
export async function loadQuotes(): Promise<Quote[]> {
  // キャッシュが存在する場合は返す
  if (quotesCache !== null) {
    return quotesCache;
  }

  try {
    // JSONファイルのパスを取得
    const quotesPath = path.join(process.cwd(), 'src', 'data', 'quotes.json');
    
    // ファイルを非同期で読み込み（UTF-8エンコーディング明示）
    const fileContent = await fs.readFile(quotesPath, 'utf-8');
    
    // JSON解析
    const data = JSON.parse(fileContent);
    
    // データ構造の検証
    if (!data || !Array.isArray(data.quotes)) {
      throw new DataAccessError(
        'Invalid JSON structure: expected { quotes: Quote[] }',
        'INVALID_STRUCTURE'
      );
    }
    
    // Quote型の検証
    const quotes: Quote[] = data.quotes;
    for (const quote of quotes) {
      if (!isValidQuote(quote)) {
        throw new DataAccessError(
          `Invalid quote structure at id ${(quote as any)?.id || 'unknown'}`,
          'INVALID_QUOTE_STRUCTURE'
        );
      }
    }
    
    // キャッシュに保存
    quotesCache = quotes;
    
    return quotes;
    
  } catch (error) {
    // ファイルシステムエラーのハンドリング
    if (error instanceof Error) {
      if ('code' in error) {
        switch (error.code) {
          case 'ENOENT':
            throw new DataAccessError(
              'Quotes data file not found',
              'FILE_NOT_FOUND'
            );
          case 'EACCES':
            throw new DataAccessError(
              'Permission denied accessing quotes data file',
              'PERMISSION_DENIED'
            );
          default:
            throw new DataAccessError(
              `File system error: ${error.message}`,
              'FILE_SYSTEM_ERROR'
            );
        }
      }
      
      // JSON解析エラー
      if (error instanceof SyntaxError) {
        throw new DataAccessError(
          'Invalid JSON format in quotes data file',
          'INVALID_JSON'
        );
      }
      
      // DataAccessErrorの再スロー
      if (error instanceof DataAccessError) {
        throw error;
      }
    }
    
    // その他の予期しないエラー
    throw new DataAccessError(
      `Unexpected error loading quotes: ${error}`,
      'UNKNOWN_ERROR'
    );
  }
}

/**
 * メモリキャッシュをクリアする
 */
export function clearQuoteCache(): void {
  quotesCache = null;
}

/**
 * キャッシュの状態を取得する
 * @returns キャッシュが読み込まれているかとキャッシュされているデータ数
 */
export function getQuoteCacheStatus(): { isLoaded: boolean; count: number } {
  return {
    isLoaded: quotesCache !== null,
    count: quotesCache?.length || 0
  };
}

/**
 * オブジェクトが有効なQuote型かどうかを検証する
 * @param obj 検証対象のオブジェクト
 * @returns Quote型として有効な場合true
 */
function isValidQuote(obj: any): obj is Quote {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'number' &&
    typeof obj.text === 'string' &&
    obj.text.length > 0 &&
    typeof obj.author === 'string' &&
    obj.author.length > 0 &&
    typeof obj.category === 'string' &&
    obj.category.length > 0 &&
    typeof obj.createdAt === 'string' &&
    obj.createdAt.length > 0 &&
    (obj.tags === undefined || Array.isArray(obj.tags))
  );
}