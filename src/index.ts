import { serve } from "@hono/node-server";
import { Hono } from "hono";

// モジュールのインポート - 実装時に有効化
// import * as routes from "./routes/index.js";
// import * as services from "./services/index.js";
// import * as models from "./models/index.js";
// import * as utils from "./utils/index.js";
// import * as data from "./data/index.js";
// import * as middleware from "./middleware/index.js";

const app = new Hono();

// 基本ルート
app.get("/", (c) => {
	return c.text("Hello Hono!");
});

// 将来のAPI実装時にルートを追加予定:
// app.route("/quotes", routes.quotesRouter);

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
