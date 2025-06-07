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