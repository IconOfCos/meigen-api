/**
 * 統一エラーハンドリングミドルウェア
 * 
 * アプリケーション全体の例外処理と統一されたエラーレスポンス形式を提供します。
 */

import type { Context } from 'hono';
import type { ErrorResponse } from '../models/response.js';
import { QuoteServiceError, QuoteNotFoundError } from '../services/quoteService.js';
import { ValidationError } from '../data/validation.js';

/**
 * エラーハンドリングミドルウェア
 * 発生したエラーの種類に応じて適切なHTTPステータスコードとエラーレスポンスを返します
 */
export const errorHandler = async (c: Context, next: () => Promise<void>) => {
  try {
    await next();
  } catch (error) {
    console.error('Error caught by error handler:', error);

    // エラーの種類に応じて適切なレスポンスを生成
    if (error instanceof QuoteNotFoundError) {
      return c.json<ErrorResponse>({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: error.message
        },
        meta: {
          timestamp: new Date().toISOString()
        }
      }, 404);
    }

    if (error instanceof QuoteServiceError) {
      const statusCode = error.code === 'NO_QUOTES_AVAILABLE' ? 404 : 500;
      return c.json<ErrorResponse>({
        success: false,
        error: {
          code: error.code,
          message: error.message
        },
        meta: {
          timestamp: new Date().toISOString()
        }
      }, statusCode);
    }

    if (error instanceof ValidationError) {
      return c.json<ErrorResponse>({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message,
          details: {
            field: error.field,
            value: error.value,
            reason: error.reason
          }
        },
        meta: {
          timestamp: new Date().toISOString()
        }
      }, 400);
    }

    // その他の予期しないエラー
    return c.json<ErrorResponse>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred'
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    }, 500);
  }
};