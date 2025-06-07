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
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.data).toEqual(validQuote);
    });

    it('nullまたはundefinedでバリデーション失敗すること', () => {
      const resultNull = validateQuote(null);
      const resultUndefined = validateQuote(undefined);

      expect(resultNull.isValid).toBe(false);
      expect(resultNull.errors).toHaveLength(1);
      expect(resultNull.errors[0].field).toBe('quote');

      expect(resultUndefined.isValid).toBe(false);
      expect(resultUndefined.errors).toHaveLength(1);
    });

    it('オブジェクト型でない場合バリデーション失敗すること', () => {
      const result = validateQuote('not an object');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('quote');
      expect(result.errors[0].reason).toBe('Quote must be an object');
    });

    describe('IDバリデーション', () => {
      it('IDが数値でない場合バリデーション失敗すること', () => {
        const invalidQuote = { ...validQuote, id: 'not a number' };
        const result = validateQuote(invalidQuote);
        
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.field === 'id')).toBe(true);
      });

      it('IDが正の整数でない場合バリデーション失敗すること', () => {
        const invalidQuote1 = { ...validQuote, id: -1 };
        const invalidQuote2 = { ...validQuote, id: 0 };
        const invalidQuote3 = { ...validQuote, id: 1.5 };
        
        [invalidQuote1, invalidQuote2, invalidQuote3].forEach(quote => {
          const result = validateQuote(quote);
          expect(result.isValid).toBe(false);
          expect(result.errors.some(e => e.field === 'id')).toBe(true);
        });
      });
    });

    describe('テキストバリデーション', () => {
      it('テキストが文字列でない場合バリデーション失敗すること', () => {
        const invalidQuote = { ...validQuote, text: 123 };
        const result = validateQuote(invalidQuote);
        
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.field === 'text')).toBe(true);
      });

      it('テキストが空の場合バリデーション失敗すること', () => {
        const invalidQuote = { ...validQuote, text: '   ' };
        const result = validateQuote(invalidQuote);
        
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.field === 'text')).toBe(true);
      });

      it('日本語文字が含まれていない場合バリデーション失敗すること', () => {
        const invalidQuote = { ...validQuote, text: 'Only English text' };
        const result = validateQuote(invalidQuote);
        
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.field === 'text' && e.reason.includes('Japanese'))).toBe(true);
      });
    });

    describe('作者バリデーション', () => {
      it('作者が文字列でない場合バリデーション失敗すること', () => {
        const invalidQuote = { ...validQuote, author: 123 };
        const result = validateQuote(invalidQuote);
        
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.field === 'author')).toBe(true);
      });

      it('作者が空の場合バリデーション失敗すること', () => {
        const invalidQuote = { ...validQuote, author: '   ' };
        const result = validateQuote(invalidQuote);
        
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.field === 'author')).toBe(true);
      });
    });

    describe('カテゴリバリデーション', () => {
      it('カテゴリが文字列でない場合バリデーション失敗すること', () => {
        const invalidQuote = { ...validQuote, category: 123 };
        const result = validateQuote(invalidQuote);
        
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.field === 'category')).toBe(true);
      });

      it('許可されていないカテゴリの場合バリデーション失敗すること', () => {
        const invalidQuote = { ...validQuote, category: '無効なカテゴリ' };
        const result = validateQuote(invalidQuote);
        
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.field === 'category')).toBe(true);
      });

      it('許可されたカテゴリの場合バリデーション成功すること', () => {
        const allowedCategories = ['人生', '成功', '愛', '友情', '勇気'];
        
        allowedCategories.forEach(category => {
          const quote = { ...validQuote, category };
          const result = validateQuote(quote);
          expect(result.isValid).toBe(true);
        });
      });
    });

    describe('作成日時バリデーション', () => {
      it('作成日時が文字列でない場合バリデーション失敗すること', () => {
        const invalidQuote = { ...validQuote, createdAt: new Date() };
        const result = validateQuote(invalidQuote);
        
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.field === 'createdAt')).toBe(true);
      });

      it('無効なISO8601形式の場合バリデーション失敗すること', () => {
        const invalidQuote = { ...validQuote, createdAt: '2024-01-01' };
        const result = validateQuote(invalidQuote);
        
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.field === 'createdAt')).toBe(true);
      });
    });

    describe('タグバリデーション', () => {
      it('タグがundefinedの場合バリデーション成功すること', () => {
        const quote = { ...validQuote };
        delete quote.tags;
        const result = validateQuote(quote);
        
        expect(result.isValid).toBe(true);
      });

      it('タグが配列でない場合バリデーション失敗すること', () => {
        const invalidQuote = { ...validQuote, tags: 'not an array' };
        const result = validateQuote(invalidQuote);
        
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.field === 'tags')).toBe(true);
      });

      it('タグ配列に文字列以外が含まれる場合バリデーション失敗すること', () => {
        const invalidQuote = { ...validQuote, tags: ['valid', 123, 'also valid'] };
        const result = validateQuote(invalidQuote);
        
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.field.startsWith('tags['))).toBe(true);
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
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.data).toEqual(validQuotes);
    });

    it('配列でない場合バリデーション失敗すること', () => {
      const result = validateQuotes('not an array');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('quotes');
    });

    it('配列内に無効なQuoteが含まれる場合バリデーション失敗すること', () => {
      const invalidQuotes = [
        validQuote,
        { ...validQuote, id: 'invalid' },
        validQuotes[1]
      ];
      
      const result = validateQuotes(invalidQuotes);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field.startsWith('quotes[1].'))).toBe(true);
    });

    it('空配列の場合バリデーション成功すること', () => {
      const result = validateQuotes([]);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.data).toEqual([]);
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