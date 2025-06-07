/**
 * CORSミドルウェア
 * 
 * クロスオリジンリクエストに対応するためのCORS設定を提供します。
 */

import { cors } from 'hono/cors';

/**
 * CORS設定オプション
 */
export const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:8080'],
  allowHeaders: ['X-Custom-Header', 'Upgrade-Insecure-Requests', 'Content-Type'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
  maxAge: 600,
  credentials: true,
};

/**
 * CORSミドルウェアのインスタンス
 * 開発環境とプロダクション環境の両方に対応
 */
export const corsMiddleware = cors(corsOptions);