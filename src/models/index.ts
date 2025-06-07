/**
 * 名言APIプロジェクトの型定義エクスポート
 * 
 * すべてのモデル関連型定義を統一的にエクスポートします。
 */

// Quote 関連の型定義
export type {
  Quote,
  CreateQuoteRequest,
  UpdateQuoteRequest
} from './quote.js';

export {
  isQuote
} from './quote.js';

// API レスポンス関連の型定義
export type {
  APIResponse,
  ErrorResponse,
  PaginatedResponse
} from './response.js';

export {
  isAPIResponse,
  isErrorResponse
} from './response.js';

// API リクエスト関連の型定義
export type {
  QuoteQueryParams,
  QuotePathParams
} from './request.js';

// テスト関連の型定義
export type {
  MockQuoteData,
  TestQuoteData
} from './test.js';