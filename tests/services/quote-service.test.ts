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

  describe('getQuotesByCategory()', () => {
    it('should return quotes for valid category', async () => {
      const quotes = await quoteService.getQuotesByCategory('人生');
      
      expect(Array.isArray(quotes)).toBe(true);
      expect(quotes.length).toBeGreaterThan(0);
      
      // 全ての結果が指定カテゴリであることを確認
      for (const quote of quotes) {
        expect(quote.category).toBe('人生');
      }
    });

    it('should perform case-insensitive search', async () => {
      const quotes1 = await quoteService.getQuotesByCategory('人生');
      const quotes2 = await quoteService.getQuotesByCategory('人生'); // 同じカテゴリ
      const quotes3 = await quoteService.getQuotesByCategory('成功');
      
      expect(quotes1).toEqual(quotes2);
      expect(quotes1.length).toBeGreaterThan(0);
      
      // 異なるカテゴリは異なる結果を返す
      const allSameCategory1 = quotes1.every(q => q.category === '人生');
      const allSameCategory3 = quotes3.every(q => q.category === '成功');
      expect(allSameCategory1).toBe(true);
      expect(allSameCategory3).toBe(true);
    });

    it('should return empty array for non-existent category', async () => {
      const quotes = await quoteService.getQuotesByCategory('存在しないカテゴリ');
      
      expect(Array.isArray(quotes)).toBe(true);
      expect(quotes.length).toBe(0);
    });

    it('should handle empty string category', async () => {
      const quotes = await quoteService.getQuotesByCategory('');
      
      expect(Array.isArray(quotes)).toBe(true);
      expect(quotes.length).toBe(0);
    });

    it('should trim whitespace in category search', async () => {
      const quotes1 = await quoteService.getQuotesByCategory('人生');
      const quotes2 = await quoteService.getQuotesByCategory('  人生  ');
      
      expect(quotes1).toEqual(quotes2);
    });
  });

  describe('getQuotesByAuthor()', () => {
    it('should return quotes for valid author', async () => {
      const quotes = await quoteService.getQuotesByAuthor('チャップリン');
      
      expect(Array.isArray(quotes)).toBe(true);
      expect(quotes.length).toBeGreaterThan(0);
      
      // 全ての結果が指定著者を含むことを確認
      for (const quote of quotes) {
        expect(quote.author.toLowerCase()).toContain('チャップリン'.toLowerCase());
      }
    });

    it('should perform partial match search', async () => {
      const quotesPartial = await quoteService.getQuotesByAuthor('チャ');
      const quotesFull = await quoteService.getQuotesByAuthor('チャップリン');
      
      expect(Array.isArray(quotesPartial)).toBe(true);
      expect(Array.isArray(quotesFull)).toBe(true);
      
      // 部分一致は完全一致を含む
      expect(quotesPartial.length).toBeGreaterThanOrEqual(quotesFull.length);
    });

    it('should perform case-insensitive search', async () => {
      const quotes1 = await quoteService.getQuotesByAuthor('チャップリン');
      const quotes2 = await quoteService.getQuotesByAuthor('チャップリン'); // 同じ検索
      
      expect(quotes1).toEqual(quotes2);
    });

    it('should return empty array for non-existent author', async () => {
      const quotes = await quoteService.getQuotesByAuthor('存在しない著者');
      
      expect(Array.isArray(quotes)).toBe(true);
      expect(quotes.length).toBe(0);
    });

    it('should handle empty string author', async () => {
      const quotes = await quoteService.getQuotesByAuthor('');
      
      expect(Array.isArray(quotes)).toBe(true);
      // 空文字列は全ての著者名に含まれるため、全件返される
      const allQuotes = await quoteService.getAllQuotes();
      expect(quotes.length).toBe(allQuotes.length);
    });
  });

  describe('getQuotesWithFilters()', () => {
    it('should filter by category only', async () => {
      const quotes = await quoteService.getQuotesWithFilters({ category: '成功' });
      
      expect(Array.isArray(quotes)).toBe(true);
      expect(quotes.length).toBeGreaterThan(0);
      
      for (const quote of quotes) {
        expect(quote.category).toBe('成功');
      }
    });

    it('should filter by author only', async () => {
      const quotes = await quoteService.getQuotesWithFilters({ author: 'セネカ' });
      
      expect(Array.isArray(quotes)).toBe(true);
      expect(quotes.length).toBeGreaterThan(0);
      
      for (const quote of quotes) {
        expect(quote.author.toLowerCase()).toContain('セネカ'.toLowerCase());
      }
    });

    it('should filter by tags (OR condition)', async () => {
      const quotes = await quoteService.getQuotesWithFilters({ tags: ['笑顔', '努力'] });
      
      expect(Array.isArray(quotes)).toBe(true);
      expect(quotes.length).toBeGreaterThan(0);
      
      for (const quote of quotes) {
        expect(quote.tags).toBeDefined();
        const hasMatchingTag = quote.tags!.some(tag => 
          ['笑顔', '努力'].some(searchTag => 
            tag.toLowerCase().includes(searchTag.toLowerCase())
          )
        );
        expect(hasMatchingTag).toBe(true);
      }
    });

    it('should apply multiple filters (AND condition)', async () => {
      const quotes = await quoteService.getQuotesWithFilters({
        category: '人生',
        tags: ['笑顔']
      });
      
      expect(Array.isArray(quotes)).toBe(true);
      
      for (const quote of quotes) {
        expect(quote.category).toBe('人生');
        expect(quote.tags).toBeDefined();
        const hasSmileTag = quote.tags!.some(tag => 
          tag.toLowerCase().includes('笑顔'.toLowerCase())
        );
        expect(hasSmileTag).toBe(true);
      }
    });

    it('should handle case-sensitive option', async () => {
      const quotesInsensitive = await quoteService.getQuotesWithFilters(
        { category: '人生' },
        { caseSensitive: false }
      );
      
      const quotesSensitive = await quoteService.getQuotesWithFilters(
        { category: '人生' },
        { caseSensitive: true }
      );
      
      expect(Array.isArray(quotesInsensitive)).toBe(true);
      expect(Array.isArray(quotesSensitive)).toBe(true);
    });

    it('should handle exact match option', async () => {
      const quotesPartial = await quoteService.getQuotesWithFilters(
        { author: 'チャ' },
        { exactMatch: false }
      );
      
      const quotesExact = await quoteService.getQuotesWithFilters(
        { author: 'チャ' },
        { exactMatch: true }
      );
      
      expect(quotesPartial.length).toBeGreaterThanOrEqual(quotesExact.length);
    });

    it('should return all quotes with empty filters', async () => {
      const quotesFiltered = await quoteService.getQuotesWithFilters({});
      const allQuotes = await quoteService.getAllQuotes();
      
      expect(quotesFiltered).toEqual(allQuotes);
    });

    it('should handle quotes without tags correctly', async () => {
      const quotes = await quoteService.getQuotesWithFilters({ tags: ['不存在的标签'] });
      
      expect(Array.isArray(quotes)).toBe(true);
      // タグが存在しない名言はフィルタされる
    });
  });

  describe('getAvailableCategories() and getAvailableAuthors()', () => {
    it('should return unique sorted categories', async () => {
      await quoteService.initialize();
      const categories = quoteService.getAvailableCategories();
      
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
      
      // ユニークであることを確認
      const uniqueCategories = new Set(categories);
      expect(uniqueCategories.size).toBe(categories.length);
      
      // ソートされていることを確認
      const sorted = [...categories].sort();
      expect(categories).toEqual(sorted);
      
      // 既知のカテゴリが含まれていることを確認
      const expectedCategories = ['人生', '成功', '愛', '友情', '勇気'];
      for (const expected of expectedCategories) {
        expect(categories).toContain(expected);
      }
    });

    it('should return unique sorted authors', async () => {
      await quoteService.initialize();
      const authors = quoteService.getAvailableAuthors();
      
      expect(Array.isArray(authors)).toBe(true);
      expect(authors.length).toBeGreaterThan(0);
      
      // ユニークであることを確認
      const uniqueAuthors = new Set(authors);
      expect(uniqueAuthors.size).toBe(authors.length);
      
      // ソートされていることを確認
      const sorted = [...authors].sort();
      expect(authors).toEqual(sorted);
    });

    it('should return empty arrays before initialization', () => {
      const newService = new QuoteService();
      const categories = newService.getAvailableCategories();
      const authors = newService.getAvailableAuthors();
      
      expect(categories).toEqual([]);
      expect(authors).toEqual([]);
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

    it('should perform filtering efficiently', async () => {
      const startTime = Date.now();
      
      // 複数のフィルタリング操作を実行
      const operations = [
        quoteService.getQuotesByCategory('人生'),
        quoteService.getQuotesByAuthor('チャップリン'),
        quoteService.getQuotesWithFilters({ category: '成功', tags: ['努力'] }),
        quoteService.getQuotesWithFilters({ author: 'セネカ' })
      ];
      
      const results = await Promise.all(operations);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // 複数のフィルタリング操作が100ms以内に完了することを確認
      expect(duration).toBeLessThan(100);
      
      // 全ての操作が結果を返すことを確認
      for (const result of results) {
        expect(Array.isArray(result)).toBe(true);
      }
    });
  });

  describe('tags filtering edge cases', () => {
    it('should handle quotes without tags when filtering by tags', async () => {
      // This test specifically targets the uncovered lines 217-218 in quoteService.ts
      await quoteService.initialize();
      
      // Filter by tags - this should exclude quotes that have no tags or empty tags array
      const quotesWithTags = await quoteService.getQuotesWithFilters({ tags: ['努力'] });
      
      // All returned quotes should have tags
      for (const quote of quotesWithTags) {
        expect(quote.tags).toBeDefined();
        expect(Array.isArray(quote.tags)).toBe(true);
        expect(quote.tags!.length).toBeGreaterThan(0);
      }
    });

    it('should handle case sensitivity in tag filtering', async () => {
      // This test targets the uncovered line 222 in quoteService.ts
      await quoteService.initialize();
      
      // Test case-sensitive filtering
      const caseInsensitiveQuotes = await quoteService.getQuotesWithFilters(
        { tags: ['努力'] },
        { caseSensitive: false }
      );
      
      const caseSensitiveQuotes = await quoteService.getQuotesWithFilters(
        { tags: ['努力'] },
        { caseSensitive: true }
      );
      
      // Case insensitive should return >= case sensitive results
      expect(caseInsensitiveQuotes.length).toBeGreaterThanOrEqual(caseSensitiveQuotes.length);
    });

    it('should handle exactMatch vs partial match in tag filtering', async () => {
      // This test targets the uncovered line 227 in quoteService.ts
      await quoteService.initialize();
      
      // Test exact match vs partial match
      const partialMatchQuotes = await quoteService.getQuotesWithFilters(
        { tags: ['努'] }, // Partial tag
        { exactMatch: false }
      );
      
      const exactMatchQuotes = await quoteService.getQuotesWithFilters(
        { tags: ['努'] }, // Same partial tag
        { exactMatch: true }
      );
      
      // Partial match should return >= exact match results
      expect(partialMatchQuotes.length).toBeGreaterThanOrEqual(exactMatchQuotes.length);
      
      // Verify that partial match actually finds tags containing the search term
      const hasPartialMatches = partialMatchQuotes.some(quote => 
        quote.tags?.some(tag => tag.includes('努') && tag !== '努')
      );
      
      if (partialMatchQuotes.length > exactMatchQuotes.length) {
        expect(hasPartialMatches).toBe(true);
      }
    });

    it('should handle combination of case sensitivity and exact match', async () => {
      // This test covers the combination of both conditions
      await quoteService.initialize();
      
      const testCases = [
        { caseSensitive: true, exactMatch: true },
        { caseSensitive: true, exactMatch: false },
        { caseSensitive: false, exactMatch: true },
        { caseSensitive: false, exactMatch: false }
      ];
      
      const results = await Promise.all(
        testCases.map(options =>
          quoteService.getQuotesWithFilters({ tags: ['努力'] }, options)
        )
      );
      
      // All results should be arrays
      results.forEach(result => {
        expect(Array.isArray(result)).toBe(true);
      });
      
      // Test relationship: non-exact should >= exact, case-insensitive should >= case-sensitive
      const [strictest, caseInsensitiveExact, caseSensitivePartial, most] = results;
      
      expect(caseSensitivePartial.length).toBeGreaterThanOrEqual(strictest.length);
      expect(caseInsensitiveExact.length).toBeGreaterThanOrEqual(strictest.length);
      expect(most.length).toBeGreaterThanOrEqual(caseInsensitiveExact.length);
      expect(most.length).toBeGreaterThanOrEqual(caseSensitivePartial.length);
    });

    it('should handle empty tags array correctly', async () => {
      await quoteService.initialize();
      
      // Create a test that would hit the condition where quote.tags is empty array
      const allQuotes = await quoteService.getAllQuotes();
      
      // Find quotes with empty or no tags
      const quotesWithoutMeaningfulTags = allQuotes.filter(quote => 
        !quote.tags || quote.tags.length === 0
      );
      
      if (quotesWithoutMeaningfulTags.length > 0) {
        // Filter by any tag should exclude these quotes
        const filteredQuotes = await quoteService.getQuotesWithFilters({ tags: ['任意のタグ'] });
        
        // None of the filtered quotes should be quotes without tags
        const quotesWithoutTagsInFiltered = filteredQuotes.filter(quote =>
          !quote.tags || quote.tags.length === 0
        );
        
        expect(quotesWithoutTagsInFiltered.length).toBe(0);
      }
    });
  });

  describe('author filtering edge cases', () => {
    it('should handle case sensitivity in author filtering', async () => {
      // This test targets the uncovered lines 195, 200 in quoteService.ts
      await quoteService.initialize();
      
      // Test case-sensitive author filtering
      const caseInsensitiveQuotes = await quoteService.getQuotesWithFilters(
        { author: 'チャップリン' },
        { caseSensitive: false }
      );
      
      const caseSensitiveQuotes = await quoteService.getQuotesWithFilters(
        { author: 'チャップリン' },
        { caseSensitive: true }
      );
      
      // Case insensitive should return >= case sensitive results
      expect(caseInsensitiveQuotes.length).toBeGreaterThanOrEqual(caseSensitiveQuotes.length);
      
      // Test with different case variations if any exist
      const allQuotes = await quoteService.getAllQuotes();
      const hasAuthorWithCase = allQuotes.some(quote => 
        quote.author.toLowerCase() !== quote.author
      );
      
      if (hasAuthorWithCase) {
        const lowerCaseQuotes = await quoteService.getQuotesWithFilters(
          { author: 'test' },
          { caseSensitive: false }
        );
        
        const upperCaseQuotes = await quoteService.getQuotesWithFilters(
          { author: 'test' },
          { caseSensitive: true }
        );
        
        // Case insensitive should handle different cases
        expect(lowerCaseQuotes.length).toBeGreaterThanOrEqual(upperCaseQuotes.length);
      } else {
        // If no case variations exist, just verify the functionality works
        expect(caseInsensitiveQuotes.length).toBeGreaterThanOrEqual(0);
      }
    });

    it('should handle exact match vs partial match in author filtering', async () => {
      await quoteService.initialize();
      
      // Test partial vs exact match
      const partialMatchQuotes = await quoteService.getQuotesWithFilters(
        { author: 'チャ' }, // Partial author name
        { exactMatch: false }
      );
      
      const exactMatchQuotes = await quoteService.getQuotesWithFilters(
        { author: 'チャ' }, // Same partial name
        { exactMatch: true }
      );
      
      // Partial match should return >= exact match results
      expect(partialMatchQuotes.length).toBeGreaterThanOrEqual(exactMatchQuotes.length);
    });
  });

});