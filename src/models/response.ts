/**
 * API レスポンス関連の型定義
 * 
 * 要件書（要件.md）に基づく厳密な仕様準拠の型定義
 */

/**
 * APIレスポンスの共通構造を定義するジェネリック型
 * 
 * 要件書のレスポンス例に基づく構造定義
 * @template T - データ部分の型（Quote、Quote[]、またはその他のデータ型）
 */
export interface APIResponse<T> {
  /** リクエストの成功/失敗を示すフラグ */
  success: boolean;
  /** レスポンスデータ（型はジェネリック T で指定） */
  data: T;
  /** レスポンスのメタデータ */
  meta: {
    /** レスポンス生成時のタイムスタンプ（ISO 8601形式） */
    timestamp: string;
  };
}

/**
 * エラーレスポンスの構造を定義する型
 */
export interface ErrorResponse {
  /** 成功フラグ（エラー時は常にfalse） */
  success: false;
  /** エラーの詳細情報 */
  error: {
    /** エラーコード */
    code: string;
    /** エラーメッセージ */
    message: string;
    /** エラーの詳細情報（オプショナル） */
    details?: unknown;
  };
  /** レスポンスのメタデータ */
  meta: {
    /** レスポンス生成時のタイムスタンプ（ISO 8601形式） */
    timestamp: string;
  };
}

/**
 * ページネーション情報を含むレスポンスの型
 * @template T - データ部分の型
 */
export interface PaginatedResponse<T> {
  /** リクエストの成功/失敗を示すフラグ */
  success: boolean;
  /** レスポンスデータ（配列） */
  data: T[];
  /** ページネーション情報を含むメタデータ */
  meta: {
    /** レスポンス生成時のタイムスタンプ（ISO 8601形式） */
    timestamp: string;
    /** ページネーション情報 */
    pagination: {
      /** 現在のページ */
      page: number;
      /** 1ページあたりのアイテム数 */
      limit: number;
      /** 総アイテム数 */
      total: number;
      /** 総ページ数 */
      totalPages: number;
    };
  };
}

/**
 * 型ガード関数：レスポンスがAPIResponse型かどうかを判定
 * @param obj - 判定対象のオブジェクト
 * @returns APIResponse型の場合true、それ以外false
 */
export function isAPIResponse<T>(obj: unknown): obj is APIResponse<T> {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  
  const response = obj as Record<string, unknown>;
  
  return (
    typeof response.success === 'boolean' &&
    response.data !== undefined &&
    typeof response.meta === 'object' &&
    response.meta !== null &&
    typeof (response.meta as Record<string, unknown>).timestamp === 'string'
  );
}

/**
 * 型ガード関数：レスポンスがErrorResponse型かどうかを判定
 * @param obj - 判定対象のオブジェクト
 * @returns ErrorResponse型の場合true、それ以外false
 */
export function isErrorResponse(obj: unknown): obj is ErrorResponse {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  
  const response = obj as Record<string, unknown>;
  
  return (
    response.success === false &&
    typeof response.error === 'object' &&
    response.error !== null &&
    typeof (response.error as Record<string, unknown>).code === 'string' &&
    typeof (response.error as Record<string, unknown>).message === 'string' &&
    typeof response.meta === 'object' &&
    response.meta !== null &&
    typeof (response.meta as Record<string, unknown>).timestamp === 'string'
  );
}