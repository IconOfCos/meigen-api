import { Hono } from 'hono';
import type { APIResponse, ErrorResponse } from '../models/response.js';
import type { Quote } from '../models/quote.js';
import { QuoteService, QuoteServiceError, QuoteNotFoundError } from '../services/quoteService.js';

const quotes = new Hono();
const quoteService = new QuoteService();

// GET /quotes/random - ランダムな名言を1つ取得
quotes.get('/random', async (c) => {
  try {
    const quote = await quoteService.getRandomQuote();
    
    return c.json<APIResponse<Quote>>({
      success: true,
      data: quote,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    if (error instanceof QuoteServiceError && error.code === 'NO_QUOTES_AVAILABLE') {
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
    }
    return c.json<ErrorResponse>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while fetching quote'
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    }, 500);
  }
});

// GET /quotes/:id - 特定のIDの名言を取得
quotes.get('/:id', async (c) => {
  const idParam = c.req.param('id');
  const id = parseInt(idParam);
  
  // IDパラメータのバリデーション
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

  try {
    const quote = await quoteService.getQuoteById(id);
    
    return c.json<APIResponse<Quote>>({
      success: true,
      data: quote,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    if (error instanceof QuoteNotFoundError) {
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
    
    return c.json<ErrorResponse>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while fetching quote'
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    }, 500);
  }
});

// GET /quotes - 全ての名言を取得（ページネーション対応）
quotes.get('/', async (c) => {
  const limit = parseInt(c.req.query('limit') || '10');
  const offset = parseInt(c.req.query('offset') || '0');
  
  try {
    const allQuotes = await quoteService.getAllQuotes();
    const total = allQuotes.length;
    const paginatedQuotes = allQuotes.slice(offset, offset + limit);
    
    return c.json({
      success: true,
      data: paginatedQuotes,
      meta: {
        timestamp: new Date().toISOString(),
        pagination: {
          page: Math.floor(offset / limit) + 1,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    return c.json<ErrorResponse>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while fetching quotes'
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    }, 500);
  }
});

// GET /quotes/category/:category - カテゴリ別名言取得
quotes.get('/category/:category', async (c) => {
  const category = c.req.param('category');
  
  try {
    const quotes = await quoteService.getQuotesByCategory(category);
    
    return c.json({
      success: true,
      data: quotes,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    return c.json<ErrorResponse>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while fetching quotes by category'
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    }, 500);
  }
});

// GET /quotes/author/:author - 作者別名言取得
quotes.get('/author/:author', async (c) => {
  const author = c.req.param('author');
  
  try {
    const quotes = await quoteService.getQuotesByAuthor(author);
    
    return c.json({
      success: true,
      data: quotes,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    return c.json<ErrorResponse>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while fetching quotes by author'
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    }, 500);
  }
});

export default quotes;