/**
 * 名言APIプロジェクトの型定義
 * 
 * 要件書（要件.md）に基づく厳密な仕様準拠の型定義
 */

/**
 * 名言オブジェクトの型定義
 * 
 * 要件書に基づく名言データの構造を定義します。
 * すべてのプロパティは必須ですが、tagsのみオプショナルです。
 */
export interface Quote {
  /** 名言の一意識別子 */
  id: number;
  /** 名言のテキスト内容 */
  text: string;
  /** 名言の著者名 */
  author: string;
  /** 名言のカテゴリ（例：人生、成功、愛、友情、勇気） */
  category: string;
  /** 名言に関連するタグの配列（オプショナル） */
  tags?: string[];
  /** 名言の作成日時（ISO 8601形式） */
  createdAt: string;
}

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