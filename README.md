# DS studio（Vue版）

一个离线可运行的 Design Tokens / 主题切换 / 组件属性联动 / 多端导出的小工具（默认中文）。

## 运行
```bash
npm i
npm run dev
```
打开：http://localhost:5173

## 说明
- 解析 `src/assets/tokens.json`（Tokens Studio 导出格式）
- 引用解析遵循：L4（Components）→ L3（Color modes）→ L2（Brands）→ L1（Primitives）
- 你在 UI 中改动的 token 会存到 localStorage（本机持久化），不改原始 tokens.json

## 导出
导出页支持：
- Web / iOS / Android 三端颜色格式化
- 导出当前（品牌+主题）或导出全量（所有品牌 × light/dark）

> 这是一个可扩展骨架：你可以继续把更多组件（tabs、modal、table…）接入到 Component Lab。
