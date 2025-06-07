import { serve } from "@hono/node-server";
import { Hono } from "hono";
import quotes from "./routes/index.js";
import { corsMiddleware, errorHandler } from "./middleware/index.js";

// モジュールのインポート - 実装時に有効化
// import * as services from "./services/index.js";
// import * as models from "./models/index.js";
// import * as utils from "./utils/index.js";
// import * as data from "./data/index.js";

const app = new Hono();

// ミドルウェアを適用
app.use('*', corsMiddleware);
app.use('*', errorHandler);

// 基本ルート
app.get("/", (c) => {
	return c.text("Hello Hono!");
});

// APIルートをマウント
app.route("/quotes", quotes);

serve(
	{
		fetch: app.fetch,
		port: 3000,
	},
	(info) => {
		console.log(`Server is running on http://localhost:${info.port}`);
	},
);

// モジュールの統合エクスポート - 他ファイルからインポート可能
// export * from "./routes/index.js";
// export * from "./services/index.js";
// export * from "./models/index.js";
// export * from "./utils/index.js";
// export * from "./data/index.js";
// export * from "./middleware/index.js";
