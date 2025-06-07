import { describe, it, expect } from 'vitest'
import type {
  Quote,
  APIResponse,
  ErrorResponse,
  PaginatedResponse,
  QuoteQueryParams,
  QuotePathParams,
  CreateQuoteRequest,
  UpdateQuoteRequest,
  MockQuoteData,
  TestQuoteData
} from '../../src/models/index.js'
import {
  isQuote,
  isAPIResponse,
  isErrorResponse
} from '../../src/models/index.js'

describe('Quote Data Schema Types', () => {
  describe('Quote型定義', () => {
    it('有効なQuoteオブジェクトが型に適合する', () => {
      const validQuote: Quote = {
        id: 1,
        text: 'テストの名言',
        author: 'テスト著者',
        category: 'テスト',
        tags: ['テスト', 'サンプル'],
        createdAt: '2025-06-07T05:51:00Z'
      }

      expect(typeof validQuote.id).toBe('number')
      expect(typeof validQuote.text).toBe('string')
      expect(typeof validQuote.author).toBe('string')
      expect(typeof validQuote.category).toBe('string')
      expect(Array.isArray(validQuote.tags)).toBe(true)
      expect(typeof validQuote.createdAt).toBe('string')
    })

    it('tagsがオプショナルであることを確認', () => {
      const quoteWithoutTags: Quote = {
        id: 2,
        text: 'タグなしの名言',
        author: 'テスト著者',
        category: 'テスト',
        createdAt: '2025-06-07T05:51:00Z'
      }

      expect(quoteWithoutTags.tags).toBeUndefined()
    })
  })

  describe('APIResponse型定義', () => {
    it('単一Quoteのレスポンス型が正しく動作する', () => {
      const singleQuoteResponse: APIResponse<Quote> = {
        success: true,
        data: {
          id: 1,
          text: 'テストの名言',
          author: 'テスト著者',
          category: 'テスト',
          createdAt: '2025-06-07T05:51:00Z'
        },
        meta: {
          timestamp: '2025-06-07T05:51:00Z'
        }
      }

      expect(singleQuoteResponse.success).toBe(true)
      expect(typeof singleQuoteResponse.data).toBe('object')
      expect(typeof singleQuoteResponse.meta.timestamp).toBe('string')
    })

    it('Quote配列のレスポンス型が正しく動作する', () => {
      const multipleQuotesResponse: APIResponse<Quote[]> = {
        success: true,
        data: [
          {
            id: 1,
            text: '名言1',
            author: '著者1',
            category: 'カテゴリ1',
            createdAt: '2025-06-07T05:51:00Z'
          },
          {
            id: 2,
            text: '名言2',
            author: '著者2',
            category: 'カテゴリ2',
            createdAt: '2025-06-07T05:51:00Z'
          }
        ],
        meta: {
          timestamp: '2025-06-07T05:51:00Z'
        }
      }

      expect(Array.isArray(multipleQuotesResponse.data)).toBe(true)
      expect(multipleQuotesResponse.data.length).toBe(2)
    })
  })

  describe('ErrorResponse型定義', () => {
    it('エラーレスポンスが正しく動作する', () => {
      const errorResponse: ErrorResponse = {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '指定された名言が見つかりません',
          details: { id: 999 }
        },
        meta: {
          timestamp: '2025-06-07T05:51:00Z'
        }
      }

      expect(errorResponse.success).toBe(false)
      expect(typeof errorResponse.error.code).toBe('string')
      expect(typeof errorResponse.error.message).toBe('string')
    })
  })

  describe('PaginatedResponse型定義', () => {
    it('ページネーション付きレスポンスが正しく動作する', () => {
      const paginatedResponse: PaginatedResponse<Quote> = {
        success: true,
        data: [
          {
            id: 1,
            text: 'ページ付き名言',
            author: '著者',
            category: 'カテゴリ',
            createdAt: '2025-06-07T05:51:00Z'
          }
        ],
        meta: {
          timestamp: '2025-06-07T05:51:00Z',
          pagination: {
            page: 1,
            limit: 10,
            total: 100,
            totalPages: 10
          }
        }
      }

      expect(Array.isArray(paginatedResponse.data)).toBe(true)
      expect(typeof paginatedResponse.meta.pagination.page).toBe('number')
      expect(typeof paginatedResponse.meta.pagination.limit).toBe('number')
      expect(typeof paginatedResponse.meta.pagination.total).toBe('number')
      expect(typeof paginatedResponse.meta.pagination.totalPages).toBe('number')
    })
  })

  describe('パラメータ型定義', () => {
    it('QuoteQueryParamsが正しく動作する', () => {
      const queryParams: QuoteQueryParams = {
        limit: 20,
        offset: 10,
        page: 2
      }

      expect(typeof queryParams.limit).toBe('number')
      expect(typeof queryParams.offset).toBe('number')
      expect(typeof queryParams.page).toBe('number')
    })

    it('QuotePathParamsが正しく動作する', () => {
      const pathParams: QuotePathParams = {
        id: '123',
        category: '人生',
        author: '作者名'
      }

      expect(typeof pathParams.id).toBe('string')
      expect(typeof pathParams.category).toBe('string')
      expect(typeof pathParams.author).toBe('string')
    })
  })

  describe('リクエスト型定義', () => {
    it('CreateQuoteRequestがidとcreatedAtを除外している', () => {
      const createRequest: CreateQuoteRequest = {
        text: '新しい名言',
        author: '新しい著者',
        category: '新しいカテゴリ',
        tags: ['新規', 'テスト']
      }

      // TypeScriptコンパイル時にエラーになることを期待
      // @ts-expect-error idは含まれていない
      const invalidRequest1: CreateQuoteRequest = { ...createRequest, id: 1 }
      
      // @ts-expect-error createdAtは含まれていない
      const invalidRequest2: CreateQuoteRequest = { ...createRequest, createdAt: '2025-06-07T05:51:00Z' }

      expect(createRequest.text).toBe('新しい名言')
      expect(createRequest.author).toBe('新しい著者')
    })

    it('UpdateQuoteRequestが部分更新を許可している', () => {
      const updateRequest: UpdateQuoteRequest = {
        text: '更新された名言'
      }

      expect(updateRequest.text).toBe('更新された名言')
      expect(updateRequest.author).toBeUndefined()
    })
  })

  describe('型ガード関数', () => {
    it('isQuote関数が正しく動作する', () => {
      const validQuote = {
        id: 1,
        text: 'テスト名言',
        author: 'テスト著者',
        category: 'テスト',
        createdAt: '2025-06-07T05:51:00Z'
      }

      const invalidQuote = {
        id: 'invalid',
        text: 123,
        author: null
      }

      expect(isQuote(validQuote)).toBe(true)
      expect(isQuote(invalidQuote)).toBe(false)
      expect(isQuote(null)).toBe(false)
      expect(isQuote(undefined)).toBe(false)
    })

    it('isAPIResponse関数が正しく動作する', () => {
      const validResponse = {
        success: true,
        data: { test: 'data' },
        meta: {
          timestamp: '2025-06-07T05:51:00Z'
        }
      }

      const invalidResponse = {
        success: true,
        data: { test: 'data' }
        // metaが欠けている
      }

      expect(isAPIResponse(validResponse)).toBe(true)
      expect(isAPIResponse(invalidResponse)).toBe(false)
    })

    it('isErrorResponse関数が正しく動作する', () => {
      const validErrorResponse = {
        success: false,
        error: {
          code: 'ERROR_CODE',
          message: 'エラーメッセージ'
        },
        meta: {
          timestamp: '2025-06-07T05:51:00Z'
        }
      }

      const invalidErrorResponse = {
        success: true, // エラーレスポンスでは false であるべき
        error: {
          code: 'ERROR_CODE',
          message: 'エラーメッセージ'
        },
        meta: {
          timestamp: '2025-06-07T05:51:00Z'
        }
      }

      expect(isErrorResponse(validErrorResponse)).toBe(true)
      expect(isErrorResponse(invalidErrorResponse)).toBe(false)
    })
  })

  describe('テストデータ型定義', () => {
    it('MockQuoteDataが正しく動作する', () => {
      const mockData: MockQuoteData = {
        quotes: [
          {
            id: 1,
            text: 'モック名言',
            author: 'モック著者',
            category: 'モック',
            createdAt: '2025-06-07T05:51:00Z'
          }
        ],
        invalidQuotes: [
          { id: 'invalid' },
          { text: 123 },
          null
        ]
      }

      expect(Array.isArray(mockData.quotes)).toBe(true)
      expect(Array.isArray(mockData.invalidQuotes)).toBe(true)
    })

    it('TestQuoteDataが正しく動作する', () => {
      const testData: TestQuoteData = {
        valid: {
          id: 1,
          text: 'テスト名言',
          author: 'テスト著者',
          category: 'テスト',
          createdAt: '2025-06-07T05:51:00Z'
        },
        invalid: {
          missingRequired: {
            text: 'テキストのみ'
          },
          wrongType: {
            id: 'invalid_id',
            text: 123
          },
          empty: {}
        }
      }

      expect(typeof testData.valid.id).toBe('number')
      expect(typeof testData.invalid.missingRequired.text).toBe('string')
      expect(testData.invalid.empty).toEqual({})
    })
  })
})