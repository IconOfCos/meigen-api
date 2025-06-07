/**
 * API リクエスト関連の型定義
 * 
 * クエリパラメータ、パスパラメータなどのリクエスト関連型定義
 */

/**
 * クエリパラメータの型定義
 */
export interface QuoteQueryParams {
  /** 取得する件数（デフォルト: 10） */
  limit?: number;
  /** オフセット（デフォルト: 0） */
  offset?: number;
  /** ページ番号（1ベース） */
  page?: number;
}

/**
 * パスパラメータの型定義
 */
export interface QuotePathParams {
  /** 名言ID */
  id?: string;
  /** カテゴリ名 */
  category?: string;
  /** 著者名 */
  author?: string;
}

/**
 * QuoteQueryParamsの型ガード関数
 * @param obj - 検証対象のオブジェクト
 * @returns obj is QuoteQueryParams
 */
export function isQuoteQueryParams(obj: unknown): obj is QuoteQueryParams {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  
  const params = obj as Record<string, unknown>;
  
  return (
    (params.limit === undefined || typeof params.limit === 'number') &&
    (params.offset === undefined || typeof params.offset === 'number') &&
    (params.page === undefined || typeof params.page === 'number')
  );
}

/**
 * QuotePathParamsの型ガード関数
 * @param obj - 検証対象のオブジェクト
 * @returns obj is QuotePathParams
 */
export function isQuotePathParams(obj: unknown): obj is QuotePathParams {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  
  const params = obj as Record<string, unknown>;
  
  return (
    (params.id === undefined || typeof params.id === 'string') &&
    (params.category === undefined || typeof params.category === 'string') &&
    (params.author === undefined || typeof params.author === 'string')
  );
}

/**
 * QuoteQueryParamsのデフォルト値を提供する関数
 * @param params - 部分的なパラメータ
 * @returns 完全なQuoteQueryParams
 */
export function getDefaultQueryParams(params: Partial<QuoteQueryParams> = {}): QuoteQueryParams {
  return {
    limit: params.limit ?? 10,
    offset: params.offset ?? 0,
    page: params.page ?? 1
  };
}