import { describe, it, expect } from 'vitest';

describe('Intentionally Failing Tests (for error message verification)', () => {
  it.skip('should demonstrate test failure message', () => {
    // このテストは意図的にスキップしています
    // 実際のエラーメッセージを見たい場合は、.skipを削除してください
    expect(1 + 1).toBe(3); // 意図的な失敗
  });

  it.skip('should demonstrate async test failure', async () => {
    // このテストも意図的にスキップしています
    const asyncFunction = () => Promise.resolve('failure');
    const result = await asyncFunction();
    expect(result).toBe('success'); // 意図的な失敗
  });

  // 正常なテスト（実際に実行される）
  it('should pass normally', () => {
    expect(2 + 2).toBe(4);
  });
});