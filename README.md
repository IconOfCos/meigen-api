# vibe coding REST API プロジェクト

このリポジトリは [claude-simone](https://github.com/Helmi/claude-simone) を使って構築したREST APIです。

## claude-simoneについて

claude-simoneは、Claude CodeによるAI支援開発に特化したプロジェクト管理フレームワークです。主な特徴：

- ソフトウェアプロジェクトを「AIが効果的に処理できる管理しやすいチャンク」に分割
- タスクの焦点を絞り、適切なスコープを保つことで「コンテキストの減衰」を防止
- 各タスクに豊富な周辺コンテキストを提供
- マイルストーン → スプリント → タスクの構造化されたワークフロー

## 特徴

- Claude Sonnet 4 + Claude Codeを使用して開発
- 手動でのコード修正は一切行っていません
- TypeScriptベースのREST API実装
- claude-simoneフレームワークによる体系的な開発プロセス