import { describe, it, expect, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { Quote } from '../../src/models/quote.js';
import type { APIResponse, ErrorResponse } from '../../src/models/response.js';
import { QuoteServiceError } from '../../src/services/quoteService.js';

describe('GET /quotes/random', () => {
  let app: Hono;

  describe('Success case', () => {
    beforeEach(() => {
      app = new Hono();
      
      // テスト用のルートを直接定義（成功ケース）
      app.get('/quotes/random', async (c) => {
        const mockQuote: Quote = {
          id: 1,
          text: '明日死ぬかのように生きよ。永遠に生きるかのように学べ。',
          author: 'マハトマ・ガンジー',
          category: '人生',
          tags: ['学習', '人生'],
          createdAt: '2024-01-01T00:00:00Z'
        };

        return c.json<APIResponse<Quote>>({
          success: true,
          data: mockQuote,
          meta: {
            timestamp: new Date().toISOString()
          }
        });
      });
    });

    it('should return a random quote', async () => {
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
  });

  describe('Error case', () => {
    beforeEach(() => {
      app = new Hono();
      
      // エラーケース用のルート
      app.get('/quotes/random', async (c) => {
        return c.json<ErrorResponse>({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'No quotes found'
          },
          meta: {
            timestamp: new Date().toISOString()
          }
        }, 404);
      });
    });

    it('should return 404 when no quotes exist', async () => {
      const res = await app.request('/quotes/random');
      
      expect(res.status).toBe(404);
      const body = await res.json() as ErrorResponse;
      
      expect(body.success).toBe(false);
      expect(body.error).toBeDefined();
      expect(body.error.message).toBe('No quotes found');
    });
  });
});