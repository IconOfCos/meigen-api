/**
 * データバリデーション機能のテスト
 * 
 * validateQuote, validateQuotes, checkDataIntegrityの包括的テスト
 */

import { describe, it, expect } from 'vitest';
import { 
  validateQuote, 
  validateQuotes, 
  checkDataIntegrity, 
  ValidationError,
  type ValidationResult,
  type DataIntegrityReport 
} from '../../src/data/validation.js';
import type { Quote } from '../../src/models/quote.js';

describe('データバリデーション', () => {
  // 有効なQuoteサンプル
  const validQuote: Quote = {
    id: 1,
    text: '人生は美しい',
    author: '太郎',
    category: '人生',
    createdAt: '2024-01-01T00:00:00.000Z',
    tags: ['哲学', '人生']
  };

  describe('validateQuote', () => {
    it('有効なQuoteオブジェクトをバリデーション成功すること', () => {
      const result = validateQuote(validQuote);
      
      expect(result).toEqual(validQuote);
    });

    it('nullまたはundefinedでバリデーション失敗すること', () => {
      expect(() => validateQuote(null)).toThrow(ValidationError);
      expect(() => validateQuote(undefined)).toThrow(ValidationError);
      
      try {
        validateQuote(null);
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).field).toBe('quote');
      }
    });

    it('オブジェクト型でない場合バリデーション失敗すること', () => {
      expect(() => validateQuote('not an object')).toThrow(ValidationError);
      
      try {
        validateQuote('not an object');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).field).toBe('quote');
        expect((error as ValidationError).reason).toBe('Quote must be an object');
      }
    });

    describe('IDバリデーション', () => {
      it('IDが数値でない場合バリデーション失敗すること', () => {
        const invalidQuote = { ...validQuote, id: 'not a number' };
        
        expect(() => validateQuote(invalidQuote)).toThrow(ValidationError);
        
        try {
          validateQuote(invalidQuote);
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError);
          expect((error as ValidationError).field).toBe('id');
        }
      });

      it('IDが正の整数でない場合バリデーション失敗すること', () => {
        const invalidQuote1 = { ...validQuote, id: -1 };
        const invalidQuote2 = { ...validQuote, id: 0 };
        const invalidQuote3 = { ...validQuote, id: 1.5 };
        
        [invalidQuote1, invalidQuote2, invalidQuote3].forEach(quote => {
          expect(() => validateQuote(quote)).toThrow(ValidationError);
        });
      });
    });

    describe('テキストバリデーション', () => {
      it('テキストが文字列でない場合バリデーション失敗すること', () => {
        const invalidQuote = { ...validQuote, text: 123 };
        
        expect(() => validateQuote(invalidQuote)).toThrow(ValidationError);
      });

      it('テキストが空の場合バリデーション失敗すること', () => {
        const invalidQuote = { ...validQuote, text: '   ' };
        
        expect(() => validateQuote(invalidQuote)).toThrow(ValidationError);
      });

      it('日本語文字が含まれていない場合バリデーション失敗すること', () => {
        const invalidQuote = { ...validQuote, text: 'Only English text' };
        
        expect(() => validateQuote(invalidQuote)).toThrow(ValidationError);
        
        try {
          validateQuote(invalidQuote);
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError);
          expect((error as ValidationError).field).toBe('text');
          expect((error as ValidationError).reason).toContain('Japanese');
        }
      });
    });

    describe('作者バリデーション', () => {
      it('作者が文字列でない場合バリデーション失敗すること', () => {
        const invalidQuote = { ...validQuote, author: 123 };
        
        expect(() => validateQuote(invalidQuote)).toThrow(ValidationError);
      });

      it('作者が空の場合バリデーション失敗すること', () => {
        const invalidQuote = { ...validQuote, author: '   ' };
        
        expect(() => validateQuote(invalidQuote)).toThrow(ValidationError);
      });
    });

    describe('カテゴリバリデーション', () => {
      it('カテゴリが文字列でない場合バリデーション失敗すること', () => {
        const invalidQuote = { ...validQuote, category: 123 };
        
        expect(() => validateQuote(invalidQuote)).toThrow(ValidationError);
      });

      it('許可されていないカテゴリの場合バリデーション失敗すること', () => {
        const invalidQuote = { ...validQuote, category: '無効なカテゴリ' };
        
        expect(() => validateQuote(invalidQuote)).toThrow(ValidationError);
      });

      it('許可されたカテゴリの場合バリデーション成功すること', () => {
        const allowedCategories = ['人生', '成功', '愛', '友情', '勇気'];
        
        allowedCategories.forEach(category => {
          const quote = { ...validQuote, category };
          const result = validateQuote(quote);
          expect(result).toEqual({ ...validQuote, category });
        });
      });
    });

    describe('作成日時バリデーション', () => {
      it('作成日時が文字列でない場合バリデーション失敗すること', () => {
        const invalidQuote = { ...validQuote, createdAt: new Date() };
        
        expect(() => validateQuote(invalidQuote)).toThrow(ValidationError);
      });

      it('無効なISO8601形式の場合バリデーション失敗すること', () => {
        const invalidQuote = { ...validQuote, createdAt: '2024-01-01' };
        
        expect(() => validateQuote(invalidQuote)).toThrow(ValidationError);
      });
    });

    describe('タグバリデーション', () => {
      it('タグがundefinedの場合バリデーション成功すること', () => {
        const quote = { ...validQuote };
        delete quote.tags;
        const result = validateQuote(quote);
        
        expect(result).toBeDefined();
      });

      it('タグが配列でない場合バリデーション失敗すること', () => {
        const invalidQuote = { ...validQuote, tags: 'not an array' };
        
        expect(() => validateQuote(invalidQuote)).toThrow(ValidationError);
      });

      it('タグ配列に文字列以外が含まれる場合バリデーション失敗すること', () => {
        const invalidQuote = { ...validQuote, tags: ['valid', 123, 'also valid'] };
        
        expect(() => validateQuote(invalidQuote)).toThrow(ValidationError);
        
        try {
          validateQuote(invalidQuote);
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError);
          expect((error as ValidationError).field).toMatch(/^tags\[\d+\]/);
        }
      });
    });
  });

  describe('validateQuotes', () => {
    const validQuotes: Quote[] = [
      validQuote,
      {
        id: 2,
        text: '成功への道のり',
        author: '花子',
        category: '成功',
        createdAt: '2024-01-02T00:00:00.000Z'
      }
    ];

    it('有効なQuote配列をバリデーション成功すること', () => {
      const result = validateQuotes(validQuotes);
      
      expect(result).toEqual(validQuotes);
    });

    it('配列でない場合バリデーション失敗すること', () => {
      expect(() => validateQuotes('not an array')).toThrow(ValidationError);
      
      try {
        validateQuotes('not an array');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).field).toBe('quotes');
      }
    });

    it('配列内に無効なQuoteが含まれる場合バリデーション失敗すること', () => {
      const invalidQuotes = [
        validQuote,
        { ...validQuote, id: 'invalid' },
        validQuotes[1]
      ];
      
      expect(() => validateQuotes(invalidQuotes)).toThrow(ValidationError);
      
      try {
        validateQuotes(invalidQuotes);
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).field).toMatch(/^quotes\[1\]\./)
      }
    });

    it('空配列の場合バリデーション成功すること', () => {
      const result = validateQuotes([]);
      
      expect(result).toEqual([]);
    });
  });

  describe('checkDataIntegrity', () => {
    const testQuotes: Quote[] = [
      {
        id: 1,
        text: '人生は美しい',
        author: '太郎',
        category: '人生',
        createdAt: '2024-01-01T00:00:00.000Z'
      },
      {
        id: 2,
        text: '成功への道のり',
        author: '花子',
        category: '成功',
        createdAt: '2024-01-02T00:00:00.000Z'
      },
      {
        id: 1, // 重複ID
        text: '愛は素晴らしい',
        author: '太郎', // 重複作者
        category: '愛',
        createdAt: '2024-01-03T00:00:00.000Z'
      }
    ];

    it('データ整合性レポートを正しく生成すること', () => {
      const report = checkDataIntegrity(testQuotes);
      
      expect(report.totalQuotes).toBe(3);
      expect(report.validQuotes).toBe(3);
      expect(report.invalidQuotes).toBe(0);
      expect(report.duplicateIds).toContain(1);
      expect(report.categoryDistribution).toEqual({
        '人生': 1,
        '成功': 1,
        '愛': 1
      });
      expect(report.authorDistribution).toEqual({
        '太郎': 2,
        '花子': 1
      });
      expect(report.qualityScore).toBeGreaterThan(0);
      expect(report.qualityScore).toBeLessThanOrEqual(100);
    });

    it('無効なデータが含まれる場合を正しく処理すること', () => {
      const quotesWithInvalid = [
        ...testQuotes,
        { id: 'invalid', text: '', author: '', category: 'invalid', createdAt: 'invalid' } as any
      ];
      
      const report = checkDataIntegrity(quotesWithInvalid);
      
      expect(report.totalQuotes).toBe(4);
      expect(report.validQuotes).toBe(3);
      expect(report.invalidQuotes).toBe(1);
      expect(report.missingFields.length).toBeGreaterThan(0);
      expect(report.qualityScore).toBeLessThan(100);
    });

    it('空配列の場合を正しく処理すること', () => {
      const report = checkDataIntegrity([]);
      
      expect(report.totalQuotes).toBe(0);
      expect(report.validQuotes).toBe(0);
      expect(report.invalidQuotes).toBe(0);
      expect(report.qualityScore).toBe(0);
    });
  });

  describe('ValidationError', () => {
    it('適切なエラーメッセージを生成すること', () => {
      const error = new ValidationError('id', 'invalid', 'must be a number');
      
      expect(error.name).toBe('ValidationError');
      expect(error.field).toBe('id');
      expect(error.value).toBe('invalid');
      expect(error.reason).toBe('must be a number');
      expect(error.message).toBe("Validation failed for field 'id': must be a number");
    });
  });
});