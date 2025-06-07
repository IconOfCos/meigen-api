import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { errorHandler } from '../../src/middleware/errorHandler.js';
import { QuoteServiceError, QuoteNotFoundError } from '../../src/services/quoteService.js';
import { ValidationError } from '../../src/data/validation.js';
import type { Context } from 'hono';

// Console.errorのモック
const mockConsoleError = vi.spyOn(console, 'error');

// Honoコンテキストのモック作成ヘルパー
const createMockContext = () => {
  const mockResponse = {
    status: 200,
    headers: new Map(),
    body: null
  };

  return {
    json: vi.fn((data, status) => {
      mockResponse.status = status || 200;
      mockResponse.body = data;
      return mockResponse;
    }),
    status: vi.fn(),
    header: vi.fn()
  } as unknown as Context;
};

describe('Error Handler Middleware Tests', () => {
  beforeEach(() => {
    mockConsoleError.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('QuoteNotFoundError handling', () => {
    it('should handle QuoteNotFoundError with 404 status', async () => {
      const mockContext = createMockContext();
      const error = new QuoteNotFoundError(123);
      
      const mockNext = vi.fn().mockRejectedValue(error);
      
      const result = await errorHandler(mockContext, mockNext);
      
      expect(mockConsoleError).toHaveBeenCalledWith('Error caught by error handler:', error);
      expect(mockContext.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Quote with id 123 not found'
        },
        meta: {
          timestamp: expect.any(String)
        }
      }, 404);
    });
  });

  describe('QuoteServiceError handling', () => {
    it('should handle NO_QUOTES_AVAILABLE error with 404 status', async () => {
      const mockContext = createMockContext();
      const error = new QuoteServiceError('No quotes available', 'NO_QUOTES_AVAILABLE');
      
      const mockNext = vi.fn().mockRejectedValue(error);
      
      await errorHandler(mockContext, mockNext);
      
      expect(mockContext.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'NO_QUOTES_AVAILABLE',
          message: 'No quotes available'
        },
        meta: {
          timestamp: expect.any(String)
        }
      }, 404);
    });

    it('should handle other QuoteServiceError with 500 status', async () => {
      const mockContext = createMockContext();
      const error = new QuoteServiceError('Service unavailable', 'SERVICE_ERROR');
      
      const mockNext = vi.fn().mockRejectedValue(error);
      
      await errorHandler(mockContext, mockNext);
      
      expect(mockContext.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'SERVICE_ERROR',
          message: 'Service unavailable'
        },
        meta: {
          timestamp: expect.any(String)
        }
      }, 500);
    });
  });

  describe('ValidationError handling', () => {
    it('should handle ValidationError with 400 status and details', async () => {
      const mockContext = createMockContext();
      const error = new ValidationError('category', 'invalid-category', 'Category not found');
      
      const mockNext = vi.fn().mockRejectedValue(error);
      
      await errorHandler(mockContext, mockNext);
      
      expect(mockContext.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: "Validation failed for field 'category': Category not found",
          details: {
            field: 'category',
            value: 'invalid-category',
            reason: 'Category not found'
          }
        },
        meta: {
          timestamp: expect.any(String)
        }
      }, 400);
    });
  });

  describe('Generic error handling', () => {
    it('should handle unknown errors with 500 status', async () => {
      const mockContext = createMockContext();
      const error = new Error('Unexpected error');
      
      const mockNext = vi.fn().mockRejectedValue(error);
      
      await errorHandler(mockContext, mockNext);
      
      expect(mockConsoleError).toHaveBeenCalledWith('Error caught by error handler:', error);
      expect(mockContext.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred'
        },
        meta: {
          timestamp: expect.any(String)
        }
      }, 500);
    });

    it('should handle non-Error objects', async () => {
      const mockContext = createMockContext();
      const error = 'String error';
      
      const mockNext = vi.fn().mockRejectedValue(error);
      
      await errorHandler(mockContext, mockNext);
      
      expect(mockConsoleError).toHaveBeenCalledWith('Error caught by error handler:', error);
      expect(mockContext.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred'
        },
        meta: {
          timestamp: expect.any(String)
        }
      }, 500);
    });
  });

  describe('Successful execution', () => {
    it('should call next() without error when no exception occurs', async () => {
      const mockContext = createMockContext();
      const mockNext = vi.fn().mockResolvedValue(undefined);
      
      await errorHandler(mockContext, mockNext);
      
      expect(mockNext).toHaveBeenCalledOnce();
      expect(mockConsoleError).not.toHaveBeenCalled();
      expect(mockContext.json).not.toHaveBeenCalled();
    });
  });

  describe('Response format validation', () => {
    it('should include timestamp in ISO format', async () => {
      const mockContext = createMockContext();
      const error = new Error('Test error');
      
      const mockNext = vi.fn().mockRejectedValue(error);
      
      await errorHandler(mockContext, mockNext);
      
      const call = (mockContext.json as any).mock.calls[0];
      const responseData = call[0];
      
      expect(responseData.meta.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should always include success: false in error responses', async () => {
      const mockContext = createMockContext();
      const errors = [
        new QuoteNotFoundError(456),
        new QuoteServiceError('Test message', 'TEST_CODE'),
        new ValidationError('field', 'value', 'reason'),
        new Error('Generic error')
      ];
      
      for (const error of errors) {
        const mockNext = vi.fn().mockRejectedValue(error);
        await errorHandler(mockContext, mockNext);
        
        const call = (mockContext.json as any).mock.lastCall;
        const responseData = call[0];
        
        expect(responseData.success).toBe(false);
      }
    });
  });
});