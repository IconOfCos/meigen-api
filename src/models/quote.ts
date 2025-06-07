/**
 * Quote（名言）関連の型定義
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
 * 名言作成用のリクエスト型
 * idとcreatedAtは自動生成されるため除外
 */
export type CreateQuoteRequest = Omit<Quote, 'id' | 'createdAt'>;

/**
 * 名言更新用のリクエスト型
 * id、createdAtは変更不可、その他は部分更新可能
 */
export type UpdateQuoteRequest = Partial<Omit<Quote, 'id' | 'createdAt'>>;

/**
 * 名言フィルタリング用の条件型
 * 各条件はオプショナルで、指定された条件のみ適用される
 */
export interface QuoteFilters {
  /** カテゴリでフィルタリング */
  category?: string;
  /** 著者名でフィルタリング */
  author?: string;
  /** タグでフィルタリング（複数指定時はOR条件） */
  tags?: string[];
}

/**
 * 名言検索オプション型
 * 検索時の動作を制御するオプション
 */
export interface QuoteSearchOptions {
  /** 大文字小文字を区別するか（デフォルト: false） */
  caseSensitive?: boolean;
  /** 完全一致で検索するか（デフォルト: false） */
  exactMatch?: boolean;
}

/**
 * 型ガード関数：オブジェクトがQuote型かどうかを判定
 * @param obj - 判定対象のオブジェクト
 * @returns Quote型の場合true、それ以外false
 */
export function isQuote(obj: any): obj is Quote {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'number' &&
    typeof obj.text === 'string' &&
    typeof obj.author === 'string' &&
    typeof obj.category === 'string' &&
    typeof obj.createdAt === 'string' &&
    (obj.tags === undefined || Array.isArray(obj.tags))
  );
}