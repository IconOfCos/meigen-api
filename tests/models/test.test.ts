import { describe, it, expect } from 'vitest';
import type { MockQuoteData, TestQuoteData } from '../../src/models/test.js';
import type { Quote } from '../../src/models/quote.js';
import { 
  isMockQuoteData, 
  isTestQuoteData, 
  createMockQuoteData, 
  createTestQuoteData 
} from '../../src/models/test.js';

describe('Test Models Tests', () => {
  describe('MockQuoteData interface', () => {
    it('should accept valid mock quote data structure', () => {
      const mockData: MockQuoteData = {
        quotes: [
          {
            id: 1,
            text: 'Test quote 1',
            author: 'Test Author 1',
            category: 'test'
          },
          {
            id: 2,
            text: 'Test quote 2',
            author: 'Test Author 2',
            category: 'test'
          }
        ],
        invalidQuotes: [
          { id: 'invalid' }, // Wrong type for id
          { text: null }, // Null text
          {} // Empty object
        ]
      };
      
      expect(mockData.quotes).toHaveLength(2);
      expect(mockData.invalidQuotes).toHaveLength(3);
      expect(mockData.quotes[0].id).toBe(1);
      expect(mockData.quotes[0].text).toBe('Test quote 1');
    });

    it('should accept empty arrays for quotes and invalidQuotes', () => {
      const emptyMockData: MockQuoteData = {
        quotes: [],
        invalidQuotes: []
      };
      
      expect(emptyMockData.quotes).toHaveLength(0);
      expect(emptyMockData.invalidQuotes).toHaveLength(0);
      expect(Array.isArray(emptyMockData.quotes)).toBe(true);
      expect(Array.isArray(emptyMockData.invalidQuotes)).toBe(true);
    });

    it('should handle complex invalid quote structures', () => {
      const complexMockData: MockQuoteData = {
        quotes: [
          {
            id: 100,
            text: 'Valid quote',
            author: 'Valid Author',
            category: 'valid'
          }
        ],
        invalidQuotes: [
          null,
          undefined,
          'string instead of object',
          123,
          { id: null, text: undefined },
          { extra: 'unexpected field' }
        ]
      };
      
      expect(complexMockData.quotes).toHaveLength(1);
      expect(complexMockData.invalidQuotes).toHaveLength(6);
      expect(complexMockData.invalidQuotes[0]).toBeNull();
      expect(complexMockData.invalidQuotes[1]).toBeUndefined();
      expect(typeof complexMockData.invalidQuotes[2]).toBe('string');
    });
  });

  describe('TestQuoteData interface', () => {
    it('should accept valid test quote data structure', () => {
      const testData: TestQuoteData = {
        valid: {
          id: 42,
          text: 'Valid test quote',
          author: 'Test Author',
          category: 'test'
        },
        invalid: {
          missingRequired: {
            id: 43,
            text: 'Missing author and category'
          },
          wrongType: {
            id: 'should be number',
            text: null,
            author: 123,
            category: false
          },
          empty: {}
        }
      };
      
      expect(testData.valid.id).toBe(42);
      expect(testData.valid.text).toBe('Valid test quote');
      expect(testData.invalid.missingRequired.id).toBe(43);
      expect(testData.invalid.wrongType.id).toBe('should be number');
      expect(Object.keys(testData.invalid.empty)).toHaveLength(0);
    });

    it('should handle partial valid quotes', () => {
      const partialTestData: TestQuoteData = {
        valid: {
          id: 1,
          text: 'Minimal valid quote',
          author: 'Author',
          category: 'category'
        },
        invalid: {
          missingRequired: {
            text: 'Only text provided'
          },
          wrongType: {
            id: 'wrong'
          },
          empty: {}
        }
      };
      
      expect(partialTestData.valid.id).toBe(1);
      expect(partialTestData.invalid.missingRequired.id).toBeUndefined();
      expect(partialTestData.invalid.missingRequired.text).toBe('Only text provided');
    });

    it('should validate invalid data structures correctly', () => {
      const invalidTestData: TestQuoteData = {
        valid: {
          id: 999,
          text: 'Test quote',
          author: 'Test Author',
          category: 'test'
        },
        invalid: {
          missingRequired: {
            // All fields are optional in Partial<Quote>
          },
          wrongType: {
            id: null,
            text: 42,
            author: [],
            category: {},
            extraField: 'should not be here'
          },
          empty: {}
        }
      };
      
      expect(invalidTestData.valid.id).toBe(999);
      expect(invalidTestData.invalid.wrongType.id).toBeNull();
      expect(invalidTestData.invalid.wrongType.text).toBe(42);
      expect(Array.isArray(invalidTestData.invalid.wrongType.author)).toBe(true);
      expect(typeof invalidTestData.invalid.wrongType.category).toBe('object');
    });
  });

  describe('Interface composition and usage', () => {
    it('should work with real Quote interface properties', () => {
      const realQuote: Quote = {
        id: 123,
        text: 'Real quote text',
        author: 'Real Author',
        category: 'philosophy'
      };

      const testDataWithReal: TestQuoteData = {
        valid: realQuote,
        invalid: {
          missingRequired: {
            id: realQuote.id,
            text: realQuote.text
            // Missing author and category
          },
          wrongType: {
            id: realQuote.text, // Wrong type: string instead of number
            text: realQuote.id, // Wrong type: number instead of string
            author: true, // Wrong type: boolean instead of string
            category: 42 // Wrong type: number instead of string
          },
          empty: {}
        }
      };

      expect(testDataWithReal.valid).toEqual(realQuote);
      expect(testDataWithReal.invalid.missingRequired.id).toBe(123);
      expect(testDataWithReal.invalid.wrongType.id).toBe('Real quote text');
    });

    it('should support test data factory pattern', () => {
      const createMockData = (count: number): MockQuoteData => {
        const quotes: Quote[] = [];
        const invalidQuotes: unknown[] = [];

        for (let i = 1; i <= count; i++) {
          quotes.push({
            id: i,
            text: `Quote ${i}`,
            author: `Author ${i}`,
            category: `Category ${i % 3 === 0 ? 'wisdom' : i % 2 === 0 ? 'motivation' : 'life'}`
          });

          if (i % 2 === 0) {
            invalidQuotes.push({ id: `invalid-${i}` });
          }
        }

        return { quotes, invalidQuotes };
      };

      const mockData = createMockData(5);
      
      expect(mockData.quotes).toHaveLength(5);
      expect(mockData.invalidQuotes).toHaveLength(2);
      expect(mockData.quotes[0].id).toBe(1);
      expect(mockData.quotes[4].category).toBe('Category life');
    });

    it('should support test assertion helpers', () => {
      const isValidQuote = (obj: unknown): obj is Quote => {
        if (typeof obj !== 'object' || obj === null) return false;
        const quote = obj as Record<string, unknown>;
        return (
          typeof quote.id === 'number' &&
          typeof quote.text === 'string' &&
          typeof quote.author === 'string' &&
          typeof quote.category === 'string'
        );
      };

      const testData: TestQuoteData = {
        valid: {
          id: 1,
          text: 'Valid',
          author: 'Author',
          category: 'category'
        },
        invalid: {
          missingRequired: { id: 1 },
          wrongType: { id: 'wrong' },
          empty: {}
        }
      };

      expect(isValidQuote(testData.valid)).toBe(true);
      expect(isValidQuote(testData.invalid.missingRequired)).toBe(false);
      expect(isValidQuote(testData.invalid.wrongType)).toBe(false);
      expect(isValidQuote(testData.invalid.empty)).toBe(false);
    });
  });

  describe('Utility functions', () => {
    describe('isMockQuoteData', () => {
      it('should return true for valid MockQuoteData', () => {
        const validData = createMockQuoteData();
        expect(isMockQuoteData(validData)).toBe(true);
        
        const dataWithQuotes = createMockQuoteData([{
          id: 1,
          text: 'Test',
          author: 'Author',
          category: 'category'
        }], ['invalid']);
        expect(isMockQuoteData(dataWithQuotes)).toBe(true);
      });

      it('should return false for invalid objects', () => {
        expect(isMockQuoteData(null)).toBe(false);
        expect(isMockQuoteData(undefined)).toBe(false);
        expect(isMockQuoteData('string')).toBe(false);
        expect(isMockQuoteData({})).toBe(false);
        expect(isMockQuoteData({ quotes: 'not array' })).toBe(false);
        expect(isMockQuoteData({ invalidQuotes: 'not array' })).toBe(false);
      });
    });

    describe('isTestQuoteData', () => {
      it('should return true for valid TestQuoteData', () => {
        const validQuote: Quote = {
          id: 1,
          text: 'Test',
          author: 'Author',
          category: 'category'
        };
        const testData = createTestQuoteData(validQuote);
        expect(isTestQuoteData(testData)).toBe(true);
      });

      it('should return false for invalid objects', () => {
        expect(isTestQuoteData(null)).toBe(false);
        expect(isTestQuoteData(undefined)).toBe(false);
        expect(isTestQuoteData('string')).toBe(false);
        expect(isTestQuoteData({})).toBe(false);
        expect(isTestQuoteData({ valid: 'not object' })).toBe(false);
        expect(isTestQuoteData({ invalid: null })).toBe(false);
      });
    });

    describe('createMockQuoteData', () => {
      it('should create empty MockQuoteData when no arguments provided', () => {
        const mockData = createMockQuoteData();
        expect(mockData.quotes).toEqual([]);
        expect(mockData.invalidQuotes).toEqual([]);
      });

      it('should create MockQuoteData with provided data', () => {
        const quotes: Quote[] = [{
          id: 1,
          text: 'Test',
          author: 'Author',
          category: 'category'
        }];
        const invalidQuotes = ['invalid', null, 123];
        
        const mockData = createMockQuoteData(quotes, invalidQuotes);
        expect(mockData.quotes).toEqual(quotes);
        expect(mockData.invalidQuotes).toEqual(invalidQuotes);
      });
    });

    describe('createTestQuoteData', () => {
      it('should create TestQuoteData with valid quote and default invalid data', () => {
        const validQuote: Quote = {
          id: 1,
          text: 'Test',
          author: 'Author',
          category: 'category'
        };
        
        const testData = createTestQuoteData(validQuote);
        expect(testData.valid).toEqual(validQuote);
        expect(testData.invalid.missingRequired).toEqual({});
        expect(testData.invalid.wrongType).toEqual({});
        expect(testData.invalid.empty).toEqual({});
      });

      it('should create TestQuoteData with custom invalid data', () => {
        const validQuote: Quote = {
          id: 1,
          text: 'Test',
          author: 'Author',
          category: 'category'
        };
        const missingRequired = { id: 1, text: 'Test' };
        const wrongType = { id: 'wrong', text: 123 };
        const empty = {};
        
        const testData = createTestQuoteData(validQuote, missingRequired, wrongType, empty);
        expect(testData.valid).toEqual(validQuote);
        expect(testData.invalid.missingRequired).toEqual(missingRequired);
        expect(testData.invalid.wrongType).toEqual(wrongType);
        expect(testData.invalid.empty).toEqual(empty);
      });
    });
  });
});