/**
 * QuoteService - 名言APIのコアビジネスロジック
 * 
 * データアクセス層を利用して、ランダム名言選択、ID検索、
 * 基本的なデータ操作機能を提供し、API層とデータ層の架け橋となるサービス層
 */

import type { Quote } from '../models/quote.js';
import { loadQuotes, DataAccessError } from '../data/index.js';

/**
 * 名言が見つからない場合のエラー
 */
export class QuoteNotFoundError extends Error {
  constructor(id: number) {
    super(`Quote with id ${id} not found`);
    this.name = 'QuoteNotFoundError';
  }
}

/**
 * QuoteServiceの一般的なエラー
 */
export class QuoteServiceError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'QuoteServiceError';
  }
}

/**
 * QuoteServiceクラス
 * 名言の取得・検索機能を提供するビジネスロジック層
 */
export class QuoteService {
  private quotes: Quote[] = [];
  private isInitialized: boolean = false;

  /**
   * サービスを初期化し、データを読み込む
   * @throws QuoteServiceError 初期化に失敗した場合
   */
  async initialize(): Promise<void> {
    try {
      this.quotes = await loadQuotes();
      this.isInitialized = true;
    } catch (error) {
      if (error instanceof DataAccessError) {
        throw new QuoteServiceError(
          `Failed to initialize QuoteService: ${error.message}`,
          'INITIALIZATION_FAILED'
        );
      }
      throw new QuoteServiceError(
        `Unexpected error during initialization: ${error}`,
        'UNKNOWN_INITIALIZATION_ERROR'
      );
    }
  }

  /**
   * ランダムな名言を取得する
   * @returns Promise<Quote> ランダムに選択された名言
   * @throws QuoteServiceError サービスが初期化されていない場合または名言がない場合
   */
  async getRandomQuote(): Promise<Quote> {
    await this.ensureInitialized();

    if (this.quotes.length === 0) {
      throw new QuoteServiceError(
        'No quotes available',
        'NO_QUOTES_AVAILABLE'
      );
    }

    const randomIndex = Math.floor(Math.random() * this.quotes.length);
    return this.quotes[randomIndex];
  }

  /**
   * 指定されたIDの名言を取得する
   * @param id 取得する名言のID
   * @returns Promise<Quote> 指定されたIDの名言
   * @throws QuoteNotFoundError 指定されたIDの名言が見つからない場合
   * @throws QuoteServiceError IDが無効な場合またはサービスが初期化されていない場合
   */
  async getQuoteById(id: number): Promise<Quote> {
    await this.ensureInitialized();

    // ID値の検証
    if (!Number.isInteger(id) || id <= 0) {
      throw new QuoteServiceError(
        `Invalid quote ID: ${id}. ID must be a positive integer`,
        'INVALID_QUOTE_ID'
      );
    }

    const quote = this.quotes.find(q => q.id === id);
    if (!quote) {
      throw new QuoteNotFoundError(id);
    }

    return quote;
  }

  /**
   * 全ての名言を取得する
   * @returns Promise<Quote[]> 全ての名言の配列
   * @throws QuoteServiceError サービスが初期化されていない場合
   */
  async getAllQuotes(): Promise<Quote[]> {
    await this.ensureInitialized();
    return [...this.quotes]; // 配列のコピーを返して元データを保護
  }

  /**
   * 現在読み込まれている名言の数を取得する
   * @returns number 名言の総数
   */
  getQuoteCount(): number {
    return this.quotes.length;
  }

  /**
   * サービスが初期化されているかを確認し、必要に応じて初期化する
   * @private
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }
}