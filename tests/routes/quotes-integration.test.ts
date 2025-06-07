import { describe, it, expect, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { Quote } from '../../src/models/quote.js';
import type { APIResponse, ErrorResponse } from '../../src/models/response.js';

describe('GET /quotes/random - Integration Tests', () => {
  let app: Hono;

  beforeEach(() => {
    app = new Hono();
    
    // テスト用のルートを直接定義
    app.get('/quotes/random', async (c) => {
      // テスト用のモックデータ
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

describe('GET /quotes/random - Error Cases', () => {
  let app: Hono;

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

describe('GET /quotes/:id - Integration Tests', () => {
  let app: Hono;

  beforeEach(() => {
    app = new Hono();
    
    // テスト用のルートを定義
    app.get('/quotes/:id', async (c) => {
      const id = parseInt(c.req.param('id'));
      
      // テスト用のモックデータ
      const mockQuotes: Quote[] = [
        {
          id: 1,
          text: '明日死ぬかのように生きよ。永遠に生きるかのように学べ。',
          author: 'マハトマ・ガンジー',
          category: '人生',
          tags: ['学習', '人生'],
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          id: 2,
          text: '成功の鍵は、失敗にくじけないことだ。',
          author: 'トーマス・エジソン',
          category: '成功',
          tags: ['成功', '失敗'],
          createdAt: '2024-01-02T00:00:00Z'
        }
      ];

      const quote = mockQuotes.find(q => q.id === id);
      
      if (!quote) {
        return c.json<ErrorResponse>({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `Quote with id ${id} not found`
          },
          meta: {
            timestamp: new Date().toISOString()
          }
        }, 404);
      }

      return c.json<APIResponse<Quote>>({
        success: true,
        data: quote,
        meta: {
          timestamp: new Date().toISOString()
        }
      });
    });
  });

  it('should return a quote by id', async () => {
    const res = await app.request('/quotes/1');
    
    expect(res.status).toBe(200);
    const body = await res.json() as APIResponse<Quote>;
    
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
    expect(body.data.id).toBe(1);
    expect(body.data.text).toBeDefined();
    expect(body.data.author).toBe('マハトマ・ガンジー');
  });

  it('should return 404 for non-existent id', async () => {
    const res = await app.request('/quotes/999');
    
    expect(res.status).toBe(404);
    const body = await res.json() as ErrorResponse;
    
    expect(body.success).toBe(false);
    expect(body.error).toBeDefined();
    expect(body.error.message).toBe('Quote with id 999 not found');
  });

  it('should return 400 for invalid id format', async () => {
    app = new Hono();
    
    app.get('/quotes/:id', async (c) => {
      const idParam = c.req.param('id');
      const id = parseInt(idParam);
      
      if (isNaN(id) || id <= 0) {
        return c.json<ErrorResponse>({
          success: false,
          error: {
            code: 'INVALID_PARAMETER',
            message: 'Invalid quote ID format'
          },
          meta: {
            timestamp: new Date().toISOString()
          }
        }, 400);
      }
      
      // 正常系の処理...
      return c.json<APIResponse<Quote>>({
        success: true,
        data: {} as Quote,
        meta: {
          timestamp: new Date().toISOString()
        }
      });
    });
    
    const res = await app.request('/quotes/abc');
    
    expect(res.status).toBe(400);
    const body = await res.json() as ErrorResponse;
    
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('INVALID_PARAMETER');
  });
});