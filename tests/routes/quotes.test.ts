import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Hono } from 'hono';
import type { Quote } from '../../src/models/quote.js';
import type { APIResponse, ErrorResponse } from '../../src/models/response.js';
import quotes from '../../src/routes/index.js';
import { QuoteService, QuoteServiceError } from '../../src/services/quoteService.js';

// QuoteServiceをモック
vi.mock('../../src/services/quoteService', () => {
  return {
    QuoteService: vi.fn(() => ({
      getRandomQuote: vi.fn()
    })),
    QuoteServiceError: class QuoteServiceError extends Error {
      constructor(message: string, public code: string) {
        super(message);
      }
    }
  };
});

describe('GET /quotes/random', () => {
  let app: Hono;
  let mockQuoteService: any;

  beforeEach(() => {
    vi.clearAllMocks();
    app = new Hono();
    app.route('/quotes', quotes);
    mockQuoteService = new QuoteService();
  });

  it('should return a random quote', async () => {
    // テストデータをモック
    const mockQuote: Quote = {
      id: 1,
      text: '明日死ぬかのように生きよ。永遠に生きるかのように学べ。',
      author: 'マハトマ・ガンジー',
      category: '人生',
      tags: ['学習', '人生'],
      createdAt: '2024-01-01T00:00:00Z'
    };

    // QuoteServiceのgetRandomQuoteメソッドをモック
    const mockService = QuoteService as any;
    mockService.prototype.getRandomQuote = vi.fn().mockResolvedValue(mockQuote);

    const res = await app.request('/quotes/random');
    
    expect(res.status).toBe(200);
    const body = await res.json() as APIResponse<Quote>;
    
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
    expect(body.data.id).toBeDefined();
    expect(body.data.text).toBeDefined();
    expect(body.data.author).toBeDefined();
    expect(body.data.category).toBeDefined();
    expect(body.meta.timestamp).toBeDefined();
  });

  it('should return 404 when no quotes exist', async () => {
    // 名言が存在しない場合のテスト
    const mockService = QuoteService as any;
    mockService.prototype.getRandomQuote = vi.fn().mockRejectedValue(
      new QuoteServiceError('No quotes available', 'NO_QUOTES_AVAILABLE')
    );
    
    const res = await app.request('/quotes/random');
    
    expect(res.status).toBe(404);
    const body = await res.json() as ErrorResponse;
    
    expect(body.success).toBe(false);
    expect(body.error).toBeDefined();
    expect(body.error.message).toBe('No quotes found');
  });
});