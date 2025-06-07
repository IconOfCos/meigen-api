import { describe, it, expect } from 'vitest';
import type { Quote, APIResponse } from '../src/models/index.js';

describe('Basic Test', () => {
  it('should pass', () => {
    expect(true).toBe(true);
  });
});

describe('TypeScript Type Definitions', () => {
  describe('Quote Interface', () => {
    it('should accept valid Quote object', () => {
      const validQuote: Quote = {
        id: 1,
        text: "人生は10%が何が起こるかで、90%がそれにどう反応するかで決まる",
        author: "チャールズ・スウィンドル",
        category: "人生",
        tags: ["ポジティブ", "成長"],
        createdAt: "2024-01-01T00:00:00Z"
      };

      expect(validQuote.id).toBe(1);
      expect(validQuote.text).toBe("人生は10%が何が起こるかで、90%がそれにどう反応するかで決まる");
      expect(validQuote.author).toBe("チャールズ・スウィンドル");
      expect(validQuote.category).toBe("人生");
      expect(validQuote.tags).toEqual(["ポジティブ", "成長"]);
      expect(validQuote.createdAt).toBe("2024-01-01T00:00:00Z");
    });

    it('should accept Quote object without optional tags', () => {
      const quoteWithoutTags: Quote = {
        id: 2,
        text: "継続は力なり",
        author: "住岡夜晃",
        category: "成功",
        createdAt: "2024-01-01T01:00:00Z"
      };

      expect(quoteWithoutTags.tags).toBeUndefined();
      expect(typeof quoteWithoutTags.id).toBe('number');
      expect(typeof quoteWithoutTags.text).toBe('string');
      expect(typeof quoteWithoutTags.author).toBe('string');
      expect(typeof quoteWithoutTags.category).toBe('string');
      expect(typeof quoteWithoutTags.createdAt).toBe('string');
    });
  });

  describe('APIResponse Generic Interface', () => {
    it('should work with Quote data type', () => {
      const singleQuoteResponse: APIResponse<Quote> = {
        success: true,
        data: {
          id: 1,
          text: "人生は10%が何が起こるかで、90%がそれにどう反応するかで決まる",
          author: "チャールズ・スウィンドル",
          category: "人生",
          tags: ["ポジティブ", "成長"],
          createdAt: "2024-01-01T00:00:00Z"
        },
        meta: {
          timestamp: "2024-01-01T12:00:00Z"
        }
      };

      expect(singleQuoteResponse.success).toBe(true);
      expect(singleQuoteResponse.data.id).toBe(1);
      expect(singleQuoteResponse.meta.timestamp).toBe("2024-01-01T12:00:00Z");
    });

    it('should work with Quote[] data type', () => {
      const quotesResponse: APIResponse<Quote[]> = {
        success: true,
        data: [
          {
            id: 1,
            text: "人生は10%が何が起こるかで、90%がそれにどう反応するかで決まる",
            author: "チャールズ・スウィンドル",
            category: "人生",
            createdAt: "2024-01-01T00:00:00Z"
          },
          {
            id: 2,
            text: "継続は力なり",
            author: "住岡夜晃",
            category: "成功",
            createdAt: "2024-01-01T01:00:00Z"
          }
        ],
        meta: {
          timestamp: "2024-01-01T12:00:00Z"
        }
      };

      expect(quotesResponse.success).toBe(true);
      expect(Array.isArray(quotesResponse.data)).toBe(true);
      expect(quotesResponse.data).toHaveLength(2);
      expect(quotesResponse.data[0].id).toBe(1);
      expect(quotesResponse.data[1].id).toBe(2);
    });
  });

});