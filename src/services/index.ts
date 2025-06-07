/**
 * ビジネスロジックサービスのエントリーポイント
 * 
 * 各サービスクラスとエラークラスを統一的にエクスポートします。
 */

// QuoteService 関連のエクスポート
export {
  QuoteService,
  QuoteNotFoundError,
  QuoteServiceError
} from './quoteService.js';

// 将来的に以下のサービスを実装予定:
// - CategoryService - カテゴリ別名言の管理
// - AuthorService - 作者別名言の管理
// - PaginationService - ページネーション処理