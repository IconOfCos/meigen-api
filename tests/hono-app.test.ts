import { describe, it, expect } from 'vitest';
import { Hono } from 'hono';

// Honoアプリケーションのテスト用アプリ作成
const createTestApp = () => {
  const app = new Hono();
  
  app.get('/', (c) => {
    return c.text('Hello Hono!');
  });
  
  app.get('/api/health', (c) => {
    return c.json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  
  app.post('/api/echo', async (c) => {
    const body = await c.req.json();
    return c.json({ echo: body });
  });
  
  return app;
};

describe('Hono Application Tests', () => {
  const app = createTestApp();

  describe('Basic Routes', () => {
    it('should return "Hello Hono!" for root path', async () => {
      const req = new Request('http://localhost/');
      const res = await app.fetch(req);
      
      expect(res.status).toBe(200);
      expect(await res.text()).toBe('Hello Hono!');
    });

    it('should return health status for /api/health', async () => {
      const req = new Request('http://localhost/api/health');
      const res = await app.fetch(req);
      
      expect(res.status).toBe(200);
      
      const data = await res.json();
      expect(data).toHaveProperty('status', 'ok');
      expect(data).toHaveProperty('timestamp');
      expect(typeof data.timestamp).toBe('string');
    });
  });

  describe('API Endpoints', () => {
    it('should echo posted JSON data', async () => {
      const testData = { message: 'Hello World', count: 123 };
      
      const req = new Request('http://localhost/api/echo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });
      
      const res = await app.fetch(req);
      
      expect(res.status).toBe(200);
      
      const data = await res.json();
      expect(data).toHaveProperty('echo');
      expect(data.echo).toEqual(testData);
    });

    it('should handle 404 for non-existent routes', async () => {
      const req = new Request('http://localhost/non-existent');
      const res = await app.fetch(req);
      
      expect(res.status).toBe(404);
    });
  });

  describe('HTTP Methods', () => {
    it('should handle GET requests properly', async () => {
      const req = new Request('http://localhost/', { method: 'GET' });
      const res = await app.fetch(req);
      
      expect(res.status).toBe(200);
    });

    it('should handle POST requests properly', async () => {
      const req = new Request('http://localhost/api/echo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true }),
      });
      const res = await app.fetch(req);
      
      expect(res.status).toBe(200);
    });

    it('should return 404 for unsupported methods on existing routes', async () => {
      const req = new Request('http://localhost/', { method: 'DELETE' });
      const res = await app.fetch(req);
      
      expect(res.status).toBe(404);
    });
  });

  describe('Request/Response Headers', () => {
    it('should handle custom headers in requests', async () => {
      const req = new Request('http://localhost/api/health', {
        headers: {
          'X-Custom-Header': 'test-value',
          'User-Agent': 'Vitest/Test-Runner',
        },
      });
      
      const res = await app.fetch(req);
      expect(res.status).toBe(200);
    });

    it('should return proper content-type for JSON responses', async () => {
      const req = new Request('http://localhost/api/health');
      const res = await app.fetch(req);
      
      expect(res.status).toBe(200);
      expect(res.headers.get('content-type')).toContain('application/json');
    });

    it('should return proper content-type for text responses', async () => {
      const req = new Request('http://localhost/');
      const res = await app.fetch(req);
      
      expect(res.status).toBe(200);
      expect(res.headers.get('content-type')).toContain('text/plain');
    });
  });
});