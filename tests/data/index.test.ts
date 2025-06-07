/**
 * データアクセス層のテスト
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { promises as fs } from 'fs';
import { loadQuotes, clearQuoteCache, getQuoteCacheStatus, DataAccessError } from '../../src/data/index.js';

// モック用のサンプルデータ
const mockValidQuotesData = {
  quotes: [
    {
      id: 1,
      text: "テスト名言1",
      author: "テスト作者1",
      category: "人生",
      tags: ["テスト"],
      createdAt: "2025-06-07T00:00:00.000Z"
    },
    {
      id: 2,
      text: "テスト名言2",
      author: "テスト作者2",
      category: "成功",
      createdAt: "2025-06-07T00:01:00.000Z"
    }
  ]
};

describe('データアクセス層', () => {
  beforeEach(() => {
    // 各テスト前にキャッシュをクリア
    clearQuoteCache();
    vi.clearAllMocks();
  });

  describe('loadQuotes()', () => {
    it('正常なJSONファイルから名言データを読み込める', async () => {
      // ファイル読み込みをモック
      vi.spyOn(fs, 'readFile').mockResolvedValue(JSON.stringify(mockValidQuotesData));

      const quotes = await loadQuotes();

      expect(quotes).toHaveLength(2);
      expect(quotes[0]).toEqual(mockValidQuotesData.quotes[0]);
      expect(quotes[1]).toEqual(mockValidQuotesData.quotes[1]);
    });

    it('キャッシュが有効に動作する', async () => {
      const readFileSpy = vi.spyOn(fs, 'readFile').mockResolvedValue(JSON.stringify(mockValidQuotesData));

      // 初回読み込み
      const quotes1 = await loadQuotes();
      expect(readFileSpy).toHaveBeenCalledTimes(1);

      // 2回目の読み込み（キャッシュから）
      const quotes2 = await loadQuotes();
      expect(readFileSpy).toHaveBeenCalledTimes(1); // 追加で呼ばれない
      expect(quotes1).toBe(quotes2); // 同じオブジェクト参照
    });

    it('ファイルが存在しない場合にDataAccessErrorをスローする', async () => {
      const error = new Error('File not found') as any;
      error.code = 'ENOENT';
      vi.spyOn(fs, 'readFile').mockRejectedValue(error);

      await expect(loadQuotes()).rejects.toThrow(DataAccessError);
      await expect(loadQuotes()).rejects.toThrow('Quotes data file not found');
    });

    it('ファイルアクセス権限がない場合にDataAccessErrorをスローする', async () => {
      const error = new Error('Permission denied') as any;
      error.code = 'EACCES';
      vi.spyOn(fs, 'readFile').mockRejectedValue(error);

      await expect(loadQuotes()).rejects.toThrow(DataAccessError);
      await expect(loadQuotes()).rejects.toThrow('Permission denied accessing quotes data file');
    });

    it('不正なJSON形式の場合にDataAccessErrorをスローする', async () => {
      vi.spyOn(fs, 'readFile').mockResolvedValue('invalid json {');

      await expect(loadQuotes()).rejects.toThrow(DataAccessError);
      await expect(loadQuotes()).rejects.toThrow('Invalid JSON format in quotes data file');
    });

    it('無効なデータ構造の場合にDataAccessErrorをスローする', async () => {
      const invalidData = { quotes: "not an array" };
      vi.spyOn(fs, 'readFile').mockResolvedValue(JSON.stringify(invalidData));

      await expect(loadQuotes()).rejects.toThrow(DataAccessError);
      await expect(loadQuotes()).rejects.toThrow('Invalid JSON structure');
    });

    it('無効なQuote構造の場合にDataAccessErrorをスローする', async () => {
      const invalidQuoteData = {
        quotes: [
          {
            id: 1,
            text: "", // 空文字列は無効
            author: "作者",
            category: "カテゴリ",
            createdAt: "2025-06-07T00:00:00.000Z"
          }
        ]
      };
      vi.spyOn(fs, 'readFile').mockResolvedValue(JSON.stringify(invalidQuoteData));

      await expect(loadQuotes()).rejects.toThrow(DataAccessError);
      await expect(loadQuotes()).rejects.toThrow('Data validation failed');
    });
  });

  describe('clearQuoteCache()', () => {
    it('キャッシュを正常にクリアする', async () => {
      vi.spyOn(fs, 'readFile').mockResolvedValue(JSON.stringify(mockValidQuotesData));

      // データを読み込んでキャッシュを作成
      await loadQuotes();
      expect(getQuoteCacheStatus().isLoaded).toBe(true);

      // キャッシュをクリア
      clearQuoteCache();
      expect(getQuoteCacheStatus().isLoaded).toBe(false);
    });
  });

  describe('getQuoteCacheStatus()', () => {
    it('キャッシュ未読み込み時の状態を正しく返す', () => {
      const status = getQuoteCacheStatus();
      expect(status.isLoaded).toBe(false);
      expect(status.count).toBe(0);
    });

    it('キャッシュ読み込み後の状態を正しく返す', async () => {
      vi.spyOn(fs, 'readFile').mockResolvedValue(JSON.stringify(mockValidQuotesData));

      await loadQuotes();
      const status = getQuoteCacheStatus();
      
      expect(status.isLoaded).toBe(true);
      expect(status.count).toBe(2);
    });
  });

  describe('DataAccessError', () => {
    it('適切なエラーコードとメッセージを持つ', () => {
      const error = new DataAccessError('Test message', 'TEST_CODE');
      
      expect(error.message).toBe('Test message');
      expect(error.code).toBe('TEST_CODE');
      expect(error.name).toBe('DataAccessError');
      expect(error instanceof Error).toBe(true);
    });
  });
});

describe('実際のファイルとの統合テスト', () => {
  it('quotes.jsonファイルを実際に読み込める', async () => {
    // キャッシュをクリア
    clearQuoteCache();
    
    // モックをクリア（実際のファイルシステムを使用）
    vi.restoreAllMocks();

    // 実際のファイルから読み込み
    const quotes = await loadQuotes();

    // 基本的な検証
    expect(Array.isArray(quotes)).toBe(true);
    expect(quotes.length).toBeGreaterThan(0);

    // 各要素がQuote型に準拠しているか確認
    for (const quote of quotes) {
      expect(typeof quote.id).toBe('number');
      expect(typeof quote.text).toBe('string');
      expect(quote.text.length).toBeGreaterThan(0);
      expect(typeof quote.author).toBe('string');
      expect(quote.author.length).toBeGreaterThan(0);
      expect(typeof quote.category).toBe('string');
      expect(quote.category.length).toBeGreaterThan(0);
      expect(typeof quote.createdAt).toBe('string');
      expect(quote.createdAt.length).toBeGreaterThan(0);
      
      if (quote.tags !== undefined) {
        expect(Array.isArray(quote.tags)).toBe(true);
      }
    }

    // 5つのカテゴリが含まれているか確認
    const categories = new Set(quotes.map(q => q.category));
    const expectedCategories = ['人生', '成功', '愛', '友情', '勇気'];
    
    for (const category of expectedCategories) {
      expect(categories.has(category)).toBe(true);
    }
  });
});