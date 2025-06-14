import { describe, it, expect } from 'vitest';
import type { QuoteQueryParams, QuotePathParams } from '../../src/models/request.js';
import { isQuoteQueryParams, isQuotePathParams, getDefaultQueryParams } from '../../src/models/request.js';

describe('Request Models Tests', () => {
  describe('QuoteQueryParams interface', () => {
    it('should accept valid query parameters', () => {
      const validParams: QuoteQueryParams = {
        limit: 10,
        offset: 0,
        page: 1
      };
      
      expect(validParams.limit).toBe(10);
      expect(validParams.offset).toBe(0);
      expect(validParams.page).toBe(1);
    });

    it('should accept partial query parameters', () => {
      const partialParams: QuoteQueryParams = {
        limit: 5
      };
      
      expect(partialParams.limit).toBe(5);
      expect(partialParams.offset).toBeUndefined();
      expect(partialParams.page).toBeUndefined();
    });

    it('should accept empty query parameters object', () => {
      const emptyParams: QuoteQueryParams = {};
      
      expect(emptyParams.limit).toBeUndefined();
      expect(emptyParams.offset).toBeUndefined();
      expect(emptyParams.page).toBeUndefined();
    });

    it('should handle various numeric values for limit', () => {
      const testCases: QuoteQueryParams[] = [
        { limit: 1 },
        { limit: 100 },
        { limit: 0 }
      ];

      testCases.forEach((params, index) => {
        expect(typeof params.limit).toBe('number');
        expect(params.limit).toBe([1, 100, 0][index]);
      });
    });

    it('should handle various numeric values for offset', () => {
      const testCases: QuoteQueryParams[] = [
        { offset: 0 },
        { offset: 10 },
        { offset: 50 }
      ];

      testCases.forEach((params, index) => {
        expect(typeof params.offset).toBe('number');
        expect(params.offset).toBe([0, 10, 50][index]);
      });
    });

    it('should handle various numeric values for page', () => {
      const testCases: QuoteQueryParams[] = [
        { page: 1 },
        { page: 5 },
        { page: 100 }
      ];

      testCases.forEach((params, index) => {
        expect(typeof params.page).toBe('number');
        expect(params.page).toBe([1, 5, 100][index]);
      });
    });
  });

  describe('QuotePathParams interface', () => {
    it('should accept valid path parameters', () => {
      const validParams: QuotePathParams = {
        id: '123',
        category: 'motivation',
        author: 'Albert Einstein'
      };
      
      expect(validParams.id).toBe('123');
      expect(validParams.category).toBe('motivation');
      expect(validParams.author).toBe('Albert Einstein');
    });

    it('should accept partial path parameters', () => {
      const partialParams: QuotePathParams = {
        id: '456'
      };
      
      expect(partialParams.id).toBe('456');
      expect(partialParams.category).toBeUndefined();
      expect(partialParams.author).toBeUndefined();
    });

    it('should accept empty path parameters object', () => {
      const emptyParams: QuotePathParams = {};
      
      expect(emptyParams.id).toBeUndefined();
      expect(emptyParams.category).toBeUndefined();
      expect(emptyParams.author).toBeUndefined();
    });

    it('should handle various string values for id', () => {
      const testCases: QuotePathParams[] = [
        { id: '1' },
        { id: '999' },
        { id: 'abc123' }
      ];

      testCases.forEach((params, index) => {
        expect(typeof params.id).toBe('string');
        expect(params.id).toBe(['1', '999', 'abc123'][index]);
      });
    });

    it('should handle various string values for category', () => {
      const testCases: QuotePathParams[] = [
        { category: 'love' },
        { category: 'life' },
        { category: 'success' }
      ];

      testCases.forEach((params, index) => {
        expect(typeof params.category).toBe('string');
        expect(params.category).toBe(['love', 'life', 'success'][index]);
      });
    });

    it('should handle various string values for author', () => {
      const testCases: QuotePathParams[] = [
        { author: 'Aristotle' },
        { author: 'Confucius' },
        { author: 'Gandhi' }
      ];

      testCases.forEach((params, index) => {
        expect(typeof params.author).toBe('string');
        expect(params.author).toBe(['Aristotle', 'Confucius', 'Gandhi'][index]);
      });
    });
  });

  describe('Interface compatibility', () => {
    it('should be compatible with HTTP request query parsing', () => {
      // Simulate URL query parameter parsing
      const mockQueryString = 'limit=20&offset=10&page=2';
      const parsedParams = Object.fromEntries(new URLSearchParams(mockQueryString));
      
      const params: QuoteQueryParams = {
        limit: parseInt(parsedParams.limit || '10'),
        offset: parseInt(parsedParams.offset || '0'),
        page: parseInt(parsedParams.page || '1')
      };
      
      expect(params.limit).toBe(20);
      expect(params.offset).toBe(10);
      expect(params.page).toBe(2);
    });

    it('should be compatible with HTTP path parameter extraction', () => {
      // Simulate path parameter extraction
      const mockPath = '/quotes/123/category/motivation/author/Einstein';
      const pathSegments = mockPath.split('/');
      
      const params: QuotePathParams = {
        id: pathSegments[2],
        category: pathSegments[4],
        author: pathSegments[6]
      };
      
      expect(params.id).toBe('123');
      expect(params.category).toBe('motivation');
      expect(params.author).toBe('Einstein');
    });
  });

  describe('Type guard functions', () => {
    describe('isQuoteQueryParams', () => {
      it('should return true for valid QuoteQueryParams', () => {
        expect(isQuoteQueryParams({})).toBe(true);
        expect(isQuoteQueryParams({ limit: 10 })).toBe(true);
        expect(isQuoteQueryParams({ limit: 10, offset: 5, page: 2 })).toBe(true);
      });

      it('should return false for invalid objects', () => {
        expect(isQuoteQueryParams(null)).toBe(false);
        expect(isQuoteQueryParams(undefined)).toBe(false);
        expect(isQuoteQueryParams('string')).toBe(false);
        expect(isQuoteQueryParams(123)).toBe(false);
        expect(isQuoteQueryParams({ limit: 'not a number' })).toBe(false);
        expect(isQuoteQueryParams({ offset: 'invalid' })).toBe(false);
        expect(isQuoteQueryParams({ page: false })).toBe(false);
      });
    });

    describe('isQuotePathParams', () => {
      it('should return true for valid QuotePathParams', () => {
        expect(isQuotePathParams({})).toBe(true);
        expect(isQuotePathParams({ id: '123' })).toBe(true);
        expect(isQuotePathParams({ id: '123', category: 'test', author: 'author' })).toBe(true);
      });

      it('should return false for invalid objects', () => {
        expect(isQuotePathParams(null)).toBe(false);
        expect(isQuotePathParams(undefined)).toBe(false);
        expect(isQuotePathParams('string')).toBe(false);
        expect(isQuotePathParams(123)).toBe(false);
        expect(isQuotePathParams({ id: 123 })).toBe(false);
        expect(isQuotePathParams({ category: false })).toBe(false);
        expect(isQuotePathParams({ author: [] })).toBe(false);
      });
    });

    describe('getDefaultQueryParams', () => {
      it('should return default values when no params provided', () => {
        const defaults = getDefaultQueryParams();
        expect(defaults).toEqual({
          limit: 10,
          offset: 0,
          page: 1
        });
      });

      it('should override defaults with provided values', () => {
        const params = getDefaultQueryParams({ limit: 20, page: 3 });
        expect(params).toEqual({
          limit: 20,
          offset: 0,
          page: 3
        });
      });

      it('should handle partial parameter objects', () => {
        const params1 = getDefaultQueryParams({ limit: 5 });
        expect(params1).toEqual({
          limit: 5,
          offset: 0,
          page: 1
        });

        const params2 = getDefaultQueryParams({ offset: 10 });
        expect(params2).toEqual({
          limit: 10,
          offset: 10,
          page: 1
        });
      });
    });
  });
});