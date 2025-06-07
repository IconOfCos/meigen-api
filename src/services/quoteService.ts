/**
 * QuoteService - 名言APIのコアビジネスロジック
 * 
 * データアクセス層を利用して、ランダム名言選択、ID検索、
 * 基本的なデータ操作機能を提供し、API層とデータ層の架け橋となるサービス層
 */

import type { Quote, QuoteFilters, QuoteSearchOptions } from '../models/quote.js';
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
   * カテゴリ別に名言を取得する
   * @param category 取得するカテゴリ名
   * @returns Promise<Quote[]> 指定されたカテゴリの名言の配列
   * @throws QuoteServiceError サービスが初期化されていない場合
   */
  async getQuotesByCategory(category: string): Promise<Quote[]> {
    await this.ensureInitialized();

    // 大文字小文字を区別しない検索
    const normalizedCategory = category.toLowerCase().trim();
    
    return this.quotes.filter(quote => 
      quote.category.toLowerCase().trim() === normalizedCategory
    );
  }

  /**
   * 著者別に名言を取得する
   * @param author 取得する著者名
   * @returns Promise<Quote[]> 指定された著者の名言の配列
   * @throws QuoteServiceError サービスが初期化されていない場合
   */
  async getQuotesByAuthor(author: string): Promise<Quote[]> {
    await this.ensureInitialized();

    // 大文字小文字を区別しない部分一致検索
    const normalizedAuthor = author.toLowerCase().trim();
    
    return this.quotes.filter(quote => 
      quote.author.toLowerCase().includes(normalizedAuthor)
    );
  }

  /**
   * 複合フィルタを使用して名言を取得する
   * @param filters フィルタ条件
   * @param options 検索オプション
   * @returns Promise<Quote[]> フィルタ条件に一致する名言の配列
   * @throws QuoteServiceError サービスが初期化されていない場合
   */
  async getQuotesWithFilters(
    filters: QuoteFilters, 
    options: QuoteSearchOptions = {}
  ): Promise<Quote[]> {
    await this.ensureInitialized();

    const { caseSensitive = false, exactMatch = false } = options;

    let filteredQuotes = [...this.quotes];

    // カテゴリフィルタ
    if (filters.category !== undefined && filters.category !== '') {
      const categoryToMatch = caseSensitive 
        ? filters.category.trim() 
        : filters.category.toLowerCase().trim();
      
      filteredQuotes = filteredQuotes.filter(quote => {
        const quoteCategory = caseSensitive 
          ? quote.category.trim() 
          : quote.category.toLowerCase().trim();
        
        return exactMatch 
          ? quoteCategory === categoryToMatch
          : quoteCategory.includes(categoryToMatch);
      });
    }

    // 著者フィルタ
    if (filters.author !== undefined && filters.author !== '') {
      const authorToMatch = caseSensitive 
        ? filters.author.trim() 
        : filters.author.toLowerCase().trim();
      
      filteredQuotes = filteredQuotes.filter(quote => {
        const quoteAuthor = caseSensitive 
          ? quote.author.trim() 
          : quote.author.toLowerCase().trim();
        
        return exactMatch 
          ? quoteAuthor === authorToMatch
          : quoteAuthor.includes(authorToMatch);
      });
    }

    // タグフィルタ（OR条件）
    if (filters.tags && filters.tags.length > 0) {
      const tagsToMatch = filters.tags.map(tag => 
        caseSensitive ? tag.trim() : tag.toLowerCase().trim()
      );
      
      filteredQuotes = filteredQuotes.filter(quote => {
        if (!quote.tags || quote.tags.length === 0) {
          return false;
        }
        
        return quote.tags.some(quoteTag => {
          const normalizedQuoteTag = caseSensitive 
            ? quoteTag.trim() 
            : quoteTag.toLowerCase().trim();
          
          return tagsToMatch.some(tagToMatch => 
            exactMatch 
              ? normalizedQuoteTag === tagToMatch
              : normalizedQuoteTag.includes(tagToMatch)
          );
        });
      });
    }

    return filteredQuotes;
  }

  /**
   * 利用可能なカテゴリの一覧を取得する
   * @returns string[] ユニークなカテゴリ名の配列
   */
  getAvailableCategories(): string[] {
    const categories = new Set(this.quotes.map(quote => quote.category));
    return Array.from(categories).sort();
  }

  /**
   * 利用可能な著者の一覧を取得する
   * @returns string[] ユニークな著者名の配列
   */
  getAvailableAuthors(): string[] {
    const authors = new Set(this.quotes.map(quote => quote.author));
    return Array.from(authors).sort();
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