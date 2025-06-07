---
task_id: "T03_S01_Project_Structure"
sprint: "S01_M001_TDD_Foundation"
milestone: "M001_TDD_Foundation"
status: "not_started"
complexity: "TBD"
estimated_hours: "1-2"
assignee: ""
created_date: "2025-06-07"
last_updated: ""
dependencies: []
tags: ["project-structure", "directories", "modules", "architecture", "foundation"]
---

# T03_S01_Project_Structure: プロジェクトディレクトリ構造の構築

## 概要
このタスクでは、名言APIプロジェクトの基盤となるディレクトリ構造を構築します。src/サブディレクトリ構造、tests/ディレクトリ構造、適切なindex.tsファイルの配置を通じて、TDD開発とモジュール化された設計の土台を確立します。

## 目的
- src/ディレクトリのサブディレクトリ構造の構築
- tests/ディレクトリ構造の確立（src/と対応）
- 各モジュールのindex.tsファイルの配置
- ES Modulesに対応したモジュールエクスポート構造の設定
- 5つのAPIエンドポイント実装を支援する組織化

## 現在のプロジェクト状況分析

### 既存構造
```
/workspaces/you_are_a_world_class_software_engineer/
├── src/
│   └── index.ts                    # Honoアプリケーションのエントリーポイント
├── tsconfig.json                   # ES Next + NodeNext設定
├── package.json                    # type: "module", Hono v4.7.11
├── biome.json                      # lint/format設定
└── 要件.md                         # 5つのAPIエンドポイント仕様
```

### 要件分析から導出されるディレクトリニーズ
要件.mdから特定した5つのAPIエンドポイント：
1. `GET /quotes` - 全ての名言を取得（ページネーション対応）
2. `GET /quotes/random` - ランダムな名言を1つ取得
3. `GET /quotes/:id` - 特定のIDの名言を取得
4. `GET /quotes/category/:category` - カテゴリ別名言取得
5. `GET /quotes/author/:author` - 作者別名言取得

### TypeScript設定考慮事項
- **Module System**: NodeNext（ES Modules完全対応）
- **Target**: ESNext（最新JavaScript機能利用可能）
- **Strict Mode**: 有効（型安全性の確保）
- **verbatimModuleSyntax**: 有効（明示的なimport/export構文）

## 受け入れ基準

### 必須要件

#### 1. src/ディレクトリ構造の構築
- [ ] `src/routes/` - APIルート定義ディレクトリが作成されている
- [ ] `src/services/` - ビジネスロジックサービスディレクトリが作成されている  
- [ ] `src/models/` - データモデル・型定義ディレクトリが作成されている
- [ ] `src/utils/` - ユーティリティ関数ディレクトリが作成されている
- [ ] `src/data/` - サンプルデータ・データアクセスディレクトリが作成されている
- [ ] `src/middleware/` - Honoミドルウェアディレクトリが作成されている

#### 2. tests/ディレクトリ構造の構築
- [ ] `tests/` - テストルートディレクトリが作成されている
- [ ] `tests/routes/` - ルートテストディレクトリが作成されている
- [ ] `tests/services/` - サービステストディレクトリが作成されている
- [ ] `tests/models/` - モデルテストディレクトリが作成されている
- [ ] `tests/utils/` - ユーティリティテストディレクトリが作成されている
- [ ] `tests/data/` - データアクセステストディレクトリが作成されている
- [ ] `tests/middleware/` - ミドルウェアテストディレクトリが作成されている

#### 3. index.tsファイルの配置
- [ ] 各サブディレクトリにindex.tsファイルが作成されている
- [ ] ES Modulesに対応したexport構文が使用されている
- [ ] 循環依存が発生しない構造になっている
- [ ] TypeScriptのstrictモードで問題なくコンパイルできる

#### 4. モジュールエクスポート構造
- [ ] 各ディレクトリから適切なmodule exportが行われている
- [ ] Named exportパターンが一貫して使用されている
- [ ] トップレベルsrc/index.tsで統合されたexportが提供されている
- [ ] importパスが明確で一貫性がある

### オプション要件
- [ ] `.gitkeep`ファイルでディレクトリの存在を保証
- [ ] 将来の拡張に対応した柔軟な構造
- [ ] 型定義ファイル（.d.ts）の分離検討
- [ ] 設定ファイル用ディレクトリの検討

## 技術ガイダンス

### ES Modulesディレクトリ組織化の原則

#### 1. モジュール境界の設計
- **単一責任の原則**: 各ディレクトリは明確な責任を持つ
- **疎結合**: ディレクトリ間の依存関係を最小化
- **高凝集**: 関連する機能は同じディレクトリに配置
- **依存方向の統一**: 上位レイヤーから下位レイヤーへの一方向依存

#### 2. ディレクトリアーキテクチャパターン
```
src/
├── routes/          # プレゼンテーション層（HTTPエンドポイント）
├── services/        # アプリケーション層（ビジネスロジック）  
├── models/          # ドメイン層（型定義・エンティティ）
├── data/            # インフラ層（データアクセス・永続化）
├── utils/           # 共通ユーティリティ（横断的関心事）
└── middleware/      # Webフレームワーク層（HTTP処理）
```

#### 3. 依存関係の流れ
```
routes → services → data
   ↓        ↓        ↓
middleware → models ← utils
```

### Index.tsファイル戦略

#### 1. 統一エントリーポイントパターン
各ディレクトリのindex.tsは以下の責任を持つ：
- サブモジュールの集約エクスポート
- 外部向けAPIの定義
- 内部実装の隠蔽
- 依存関係の整理

#### 2. Named Export推奨パターン
```typescript
// 推奨: Named Export
export { QuoteService } from './quote-service.js'
export { CategoryService } from './category-service.js'

// 非推奨: Default Export
export default { QuoteService, CategoryService }
```

#### 3. 型定義とランタイムコードの分離
```typescript
// models/index.ts
export type { Quote, APIResponse } from './types.js'
export { validateQuote, createQuote } from './validators.js'
```

### 命名規則の統一

#### 1. ディレクトリ命名
- 小文字 + ケバブケース（必要に応じて）
- 複数形を使用（内容が複数のファイルの場合）
- 動詞よりも名詞を優先
- フレームワーク慣習との整合性

#### 2. ファイル命名
- ケバブケース（kebab-case）
- 機能を表す説明的な名前
- TypeScript標準慣習に準拠
- 拡張子は明示的に.tsまたは.js

#### 3. Export命名
- PascalCase（クラス・インターフェース）
- camelCase（関数・変数）
- UPPER_SNAKE_CASE（定数）
- 省略形より完全な名前を優先

### 将来のスケーラビリティ考慮事項

#### 1. 水平拡張対応
- 新しいAPIエンドポイントの追加容易性
- 新しいサービス層の統合
- データソースの変更・追加対応
- ミドルウェアの拡張性

#### 2. 垂直拡張対応
- 複雑なビジネスロジックの分離
- マイクロサービス分割の準備
- 外部サービス統合の準備
- パフォーマンス最適化の余地

#### 3. メンテナンス性
- コードの発見しやすさ
- テストファイルとの対応関係明確化
- リファクタリングの影響範囲最小化
- 新規開発者のオンボーディング効率

## 実装手順

### Phase 1: 基本ディレクトリ構造の作成
1. src/サブディレクトリの作成
   - routes/, services/, models/, utils/, data/, middleware/
   - 各ディレクトリの役割明確化
   - .gitkeepファイルによる空ディレクトリ保持

2. tests/ディレクトリ構造の作成
   - src/構造と対応するテストディレクトリ
   - テスト用ヘルパー・ユーティリティ用ディレクトリ
   - テストデータ用ディレクトリ

### Phase 2: Index.tsファイルの配置
1. 各ディレクトリにindex.tsファイル作成
   - 空のnamed exportから開始
   - 将来の拡張を考慮したコメント
   - TypeScriptコンパイレーション確認

2. トップレベルindex.tsの更新
   - 各サブモジュールの統合エクスポート
   - 既存のHonoアプリケーション統合
   - ES Modules対応の確認

### Phase 3: モジュールエクスポート構造の確立
1. Named Export パターンの統一
   - 各index.tsでのエクスポート戦略決定
   - インポート・エクスポートパスの統一
   - 循環依存の検出・解決

2. 型安全なモジュール解決
   - TypeScriptコンパイレーション検証
   - strictモードでの動作確認
   - 型推論の正常動作確認

### Phase 4: 統合検証と最適化
1. 全体構造の検証
   - ディレクトリ構造の論理的一貫性
   - 依存関係の適切性
   - 命名規則の統一性

2. 開発体験の確認
   - IDEでのナビゲーション
   - 自動補完・型推論の動作
   - ビルドプロセスの効率性

## 統合ガイダンス

### 既存プロジェクトとの統合

#### 1. tsconfig.json設定活用
- 既存のmodule: "NodeNext"設定の活用
- target: "ESNext"に対応したディレクトリ構造
- outDir設定との整合性確保
- strictモード設定の準拠

#### 2. package.json統合
- "type": "module"設定との整合性
- 既存のscriptsとの連携
- 依存関係管理の統一
- ビルドプロセスの統合

### 他タスクとの連携

#### 1. T01_S01_Vitest_Setup との連携
- tests/ディレクトリ構造のVitest統合準備
- テストファイル命名規則の整合性
- カバレッジレポート対象の明確化
- テスト実行対象の組織化

#### 2. T02_S01_TypeScript_Types との連携
- models/ディレクトリでの型定義配置準備
- 型エクスポート構造の基盤提供
- 依存関係注入ポイントの準備
- 型安全なモジュール解決の基盤

### Honoアプリケーション統合

#### 1. 既存index.tsとの統合
- 現在のHonoアプリケーション構造の保持
- ルート定義の分離準備
- ミドルウェア統合の準備
- アプリケーション起動処理の保持

#### 2. API開発準備
- 5つのAPIエンドポイント実装の準備
- ルーティング構造の基盤提供
- サービス層分離の準備
- データアクセス層の基盤

## 検証方法

### 構造的検証
1. **ディレクトリ存在確認**
   - すべての予定ディレクトリの作成確認
   - .gitkeepファイルの配置確認
   - ディレクトリ階層の正確性確認

2. **ファイル配置確認**
   - 各index.tsファイルの配置確認
   - TypeScriptファイルの構文確認
   - ES Modulesの動作確認

### 機能的検証
1. **コンパイレーション確認**
   - TypeScriptコンパイレーション成功
   - strictモードでのエラー無し
   - ビルド出力の確認

2. **モジュール解決確認**
   - import/exportの動作確認
   - 循環依存の不存在確認
   - 型推論の正常動作確認

### 統合検証
1. **既存機能の保持**
   - 現在のHonoアプリケーション動作継続
   - npm scriptsの正常動作
   - 開発サーバーの起動確認

2. **拡張準備の確認**
   - 新しいファイル追加の容易性
   - テストファイル配置の準備状況
   - 次の開発段階への準備状況

## 注意事項
- 既存のindex.tsファイルの機能を破壊しない
- ES Modules設定（package.json type: "module"）との整合性を維持
- TypeScriptのstrictモード設定でエラーが発生しない構造にする
- 将来の機能拡張を阻害しない柔軟な設計を維持
- 空のディレクトリでもGit管理対象となるよう.gitkeepファイルを配置

## 完了条件
このタスクは以下のすべてが満たされた時点で完了とする：
1. すべての受け入れ基準（必須要件）がクリアされている
2. TypeScriptのstrictモードでエラーなくコンパイルできる
3. 既存のHonoアプリケーションが正常に動作する
4. 他のタスク（Vitest設定、TypeScript型定義）との統合準備が完了している
5. 次のスプリントでの5つのAPIエンドポイント実装に必要な基盤が整っている