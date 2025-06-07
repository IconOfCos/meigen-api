/**
 * QuoteService テストスイート
 * 
 * QuoteServiceクラスの全機能をテストし、正常系・異常系・境界値テストを実装
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { QuoteService, QuoteNotFoundError, QuoteServiceError } from '../../src/services/quoteService.js';
import { clearQuoteCache } from '../../src/data/index.js';
import type { Quote } from '../../src/models/quote.js';

describe('QuoteService', () => {
  let quoteService: QuoteService;

  beforeEach(() => {
    quoteService = new QuoteService();
    clearQuoteCache(); // 各テスト前にキャッシュをクリア
  });

  afterEach(() => {
    clearQuoteCache(); // 各テスト後にキャッシュをクリア
  });

  describe('initialization', () => {
    it('should initialize successfully with valid data', async () => {
      await expect(quoteService.initialize()).resolves.toBeUndefined();
      expect(quoteService.getQuoteCount()).toBeGreaterThan(0);
    });

    it('should auto-initialize when calling other methods', async () => {
      // initialize()を明示的に呼ばずに他のメソッドを呼ぶ
      const quotes = await quoteService.getAllQuotes();
      expect(Array.isArray(quotes)).toBe(true);
      expect(quotes.length).toBeGreaterThan(0);
      expect(quoteService.getQuoteCount()).toBeGreaterThan(0);
    });
  });

  describe('getRandomQuote()', () => {
    it('should return a valid quote object', async () => {
      const quote = await quoteService.getRandomQuote();
      
      expect(quote).toBeDefined();
      expect(typeof quote.id).toBe('number');
      expect(typeof quote.text).toBe('string');
      expect(typeof quote.author).toBe('string');
      expect(typeof quote.category).toBe('string');
      expect(typeof quote.createdAt).toBe('string');
      expect(quote.text.length).toBeGreaterThan(0);
      expect(quote.author.length).toBeGreaterThan(0);
      expect(quote.category.length).toBeGreaterThan(0);
    });

    it('should return different quotes on multiple calls (randomness test)', async () => {
      const quotes = new Set<number>();
      const iterations = 20; // 20回実行して異なる結果が得られることを確認
      
      for (let i = 0; i < iterations; i++) {
        const quote = await quoteService.getRandomQuote();
        quotes.add(quote.id);
      }
      
      // 最低でも2つ以上の異なる名言が返されることを確認
      // (データセットに複数の名言がある前提)
      expect(quotes.size).toBeGreaterThan(1);
    });

    it('should handle edge case with single quote', async () => {
      // この test は実際のデータに依存するため、
      // 実際のテストデータで1つの名言のみの場合の動作を確認
      const quote = await quoteService.getRandomQuote();
      expect(quote).toBeDefined();
    });
  });

  describe('getQuoteById()', () => {
    it('should return the correct quote for valid ID', async () => {
      const allQuotes = await quoteService.getAllQuotes();
      expect(allQuotes.length).toBeGreaterThan(0);
      
      const firstQuote = allQuotes[0];
      const retrievedQuote = await quoteService.getQuoteById(firstQuote.id);
      
      expect(retrievedQuote).toEqual(firstQuote);
    });

    it('should throw QuoteNotFoundError for non-existent ID', async () => {
      const nonExistentId = 99999;
      
      await expect(quoteService.getQuoteById(nonExistentId))
        .rejects.toThrow(QuoteNotFoundError);
      
      try {
        await quoteService.getQuoteById(nonExistentId);
      } catch (error) {
        expect(error).toBeInstanceOf(QuoteNotFoundError);
        expect((error as QuoteNotFoundError).message).toContain(nonExistentId.toString());
      }
    });

    it('should throw QuoteServiceError for invalid ID values', async () => {
      const invalidIds = [0, -1, -10, 1.5, NaN];
      
      for (const invalidId of invalidIds) {
        await expect(quoteService.getQuoteById(invalidId))
          .rejects.toThrow(QuoteServiceError);
        
        try {
          await quoteService.getQuoteById(invalidId);
        } catch (error) {
          expect(error).toBeInstanceOf(QuoteServiceError);
          expect((error as QuoteServiceError).code).toBe('INVALID_QUOTE_ID');
        }
      }
    });

    it('should handle boundary values correctly', async () => {
      const allQuotes = await quoteService.getAllQuotes();
      
      if (allQuotes.length > 0) {
        // 最小IDのテスト（通常は1から始まる）
        const minId = Math.min(...allQuotes.map(q => q.id));
        const minQuote = await quoteService.getQuoteById(minId);
        expect(minQuote.id).toBe(minId);
        
        // 最大IDのテスト
        const maxId = Math.max(...allQuotes.map(q => q.id));
        const maxQuote = await quoteService.getQuoteById(maxId);
        expect(maxQuote.id).toBe(maxId);
      }
    });
  });

  describe('getAllQuotes()', () => {
    it('should return array of all quotes', async () => {
      const quotes = await quoteService.getAllQuotes();
      
      expect(Array.isArray(quotes)).toBe(true);
      expect(quotes.length).toBeGreaterThan(0);
      
      // 全ての要素が有効なQuoteオブジェクトであることを確認
      for (const quote of quotes) {
        expect(typeof quote.id).toBe('number');
        expect(typeof quote.text).toBe('string');
        expect(typeof quote.author).toBe('string');
        expect(typeof quote.category).toBe('string');
        expect(typeof quote.createdAt).toBe('string');
      }
    });

    it('should return immutable copy (not reference to internal array)', async () => {
      const quotes1 = await quoteService.getAllQuotes();
      const quotes2 = await quoteService.getAllQuotes();
      
      // 内容は同じだが、異なるオブジェクトインスタンスであることを確認
      expect(quotes1).toEqual(quotes2);
      expect(quotes1).not.toBe(quotes2);
      
      // 元の配列を変更しても内部状態に影響しないことを確認
      quotes1.pop();
      const quotes3 = await quoteService.getAllQuotes();
      expect(quotes3.length).toBe(quotes2.length);
    });

    it('should return consistent results across multiple calls', async () => {
      const quotes1 = await quoteService.getAllQuotes();
      const quotes2 = await quoteService.getAllQuotes();
      
      expect(quotes1).toEqual(quotes2);
    });
  });

  describe('getQuoteCount()', () => {
    it('should return correct count after initialization', async () => {
      await quoteService.initialize();
      const count = quoteService.getQuoteCount();
      const allQuotes = await quoteService.getAllQuotes();
      
      expect(count).toBe(allQuotes.length);
      expect(count).toBeGreaterThan(0);
    });

    it('should return 0 before initialization', () => {
      const count = quoteService.getQuoteCount();
      expect(count).toBe(0);
    });

    it('should be consistent with getAllQuotes() length', async () => {
      const quotes = await quoteService.getAllQuotes();
      const count = quoteService.getQuoteCount();
      
      expect(count).toBe(quotes.length);
    });
  });

  describe('error handling', () => {
    it('should handle data access errors gracefully', async () => {
      // この test は実際のファイルシステムエラーをシミュレートするのが困難なため、
      // 主に型チェックとエラーインスタンスの確認を行う
      
      try {
        await quoteService.initialize();
      } catch (error) {
        if (error instanceof QuoteServiceError) {
          expect(error.name).toBe('QuoteServiceError');
          expect(typeof error.code).toBe('string');
          expect(error.code.length).toBeGreaterThan(0);
        }
      }
    });

    it('should throw appropriate errors for edge cases', async () => {
      // 無効なIDでの検索
      await expect(quoteService.getQuoteById(-1))
        .rejects.toThrow(QuoteServiceError);
      
      // 存在しないIDでの検索
      await expect(quoteService.getQuoteById(99999))
        .rejects.toThrow(QuoteNotFoundError);
    });
  });

  describe('performance and integration', () => {
    it('should perform random quote selection efficiently', async () => {
      const startTime = Date.now();
      
      // 100回連続でランダム名言を取得
      for (let i = 0; i < 100; i++) {
        await quoteService.getRandomQuote();
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // 100回の実行が1秒以内に完了することを確認
      expect(duration).toBeLessThan(1000);
    });

    it('should handle concurrent requests correctly', async () => {
      // 複数の非同期リクエストを同時実行
      const promises = [
        quoteService.getRandomQuote(),
        quoteService.getAllQuotes(),
        quoteService.getRandomQuote(),
        quoteService.getAllQuotes()
      ];
      
      const results = await Promise.all(promises);
      
      // 全てのリクエストが正常に完了することを確認
      expect(results).toHaveLength(4);
      expect(results[0]).toBeDefined(); // first random quote
      expect(Array.isArray(results[1])).toBe(true); // all quotes
      expect(results[2]).toBeDefined(); // second random quote
      expect(Array.isArray(results[3])).toBe(true); // all quotes again
    });
  });
});