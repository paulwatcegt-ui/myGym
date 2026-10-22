# myGym AI 教练：新增供应商使用说明

本次新增 Kimi、智谱 GLM、MiniMax、讯飞星火、腾讯混元和豆包六个独立选项。手机端与服务端共用供应商信息及请求适配器，不依赖自定义接口入口来区分它们。

## 配置步骤

1. 打开 AI 教练设置，选择使用自己的 API 密钥。
2. 选择供应商，填写该平台签发的密钥；讯飞填写 HTTP API Password。
3. 填写控制台显示的准确模型 ID。豆包可使用对应服务支持的模型 ID 或推理接入点 ID（ep-…）。不填统一默认型号，避免误用无权限或不兼容的模型。
4. 保存并启用。可尝试“列出模型”，但不是保存的前提；部分供应商/账户没有兼容的模型列表接口，失败后仍可手动填写。

保存只保存配置，不代表已经联网验证成功。首次实际运行才会验证所填模型、凭据和账户权限，请使用支持文本 Chat Completions 的模型。

## 接口与账户区别

| 选项 | 预设基础地址 | 凭据与模型说明 |
| --- | --- | --- |
| Kimi（月之暗面） | https://api.moonshot.cn/v1 | 中国区开放平台 API Key；填写可调用的 Kimi 模型 ID |
| GLM（智谱 AI） | https://open.bigmodel.cn/api/paas/v4 | 普通开放平台 API Key；不等同于 Coding Plan 专用入口 |
| MiniMax（稀宇科技） | https://api.minimax.cn/v1 | 中国区开放平台 API Key；模型填写完整 ID，大小写按控制台 |
| 星火（科大讯飞） | https://spark-api-open.xf-yun.com/v1 | HTTP API Password；不使用 WebSocket 的 APPID/APIKey/APISecret 组合；填写此 HTTP 入口支持的 model |
| 混元（腾讯） | https://api.hunyuan.cloud.tencent.com/v1 | 混元兼容接口 API Key，不是 SecretId/SecretKey；此入口面向仍可用的原混元账户服务 |
| 豆包（字节跳动） | https://ark.cn-beijing.volces.com/api/v3 | 火山方舟普通模型服务 API Key；模型或接入点需已开通，不等同于 Coding Plan 入口 |

混元官方已提示新模型服务逐步迁往 TokenHub，本选项接入的是文档中仍支持原账户的兼容接口；TokenHub 的独立地址、权限和模型不在本次已验证范围。其他地区或套餐的接口可使用原有 OpenAI-compatible endpoint，自行填写匹配账户的地址，不要混用密钥。

## 请求适配

- 各供应商使用独立标识和鉴权变量；手机仍使用原生 HTTP 通道，服务端使用共享 HTTPS 适配器。
- GLM v4、豆包 v3 等路径正确拼接，避免多加一段 /v1。
- Kimi、GLM、星火、豆包使用 JSON object 请求；不接受该参数的接口沿用已有受控降级，输出仍需通过提案校验。
- MiniMax 显式启用 reasoning_split，把思考内容与最终回答分开，使用文档建议的 max_completion_tokens；不强制关闭部分模型必须开启的思考。
- MiniMax 和混元不默认发送未在本次核对页面确认的 response_format 参数，继续用共享提示词要求结构化输出，并执行现有解析、修复和验证。
- 星火通用接口兼容 Lite 的输出上限，最大输出限制为 4096 token；复杂提案可能被截断，届时应缩小请求范围或另选供应商，不能将截断内容当作成功提案。
- 切换供应商会清空尚未保存的密钥输入，另一供应商已保存的密钥不会被自动复用。

## 验证范围

使用模拟凭据和响应测试各家请求地址、鉴权、模型传递、手动配置、缺失凭据、401、截断处理及手机端注册。没有使用真实密钥或账户额度进行调用，因此不宣称每个账户和模型均已在线验证。桌面浏览器还受供应商 CORS 策略影响；Android 原生能力仍需真机验收。

前一轮的移动版预览、DeepSeek 改动继续保留。本次没有提交、推送或更新已安装 APK；要在手机使用新增选项，需重新构建并安装新版。

## 官方资料

核对日期：2026-10-22。

- [Kimi Chat Completions](https://platform.kimi.com/docs/api/chat)
- [智谱 OpenAI 兼容接口](https://docs.bigmodel.cn/cn/guide/develop/openai/introduction)
- [MiniMax OpenAI SDK](https://platform.minimax.cn/docs/api-reference/text-openai-api)
- [星火 HTTP 调用](https://www.xfyun.cn/doc/spark/HTTP调用文档.html)
- [混元 OpenAI 兼容接口与迁移说明](https://cloud.tencent.com/document/product/1729/111007)
- [火山方舟第三方工具接入](https://docs.volcengine.com/docs/ark/integrate-third-party-tools?lang=zh)

## 本次检查结果

- 相关前端测试：4 个文件、57 项通过。
- 供应商适配与回归：55 项通过，覆盖新增六家及既有适配器。
- 独立浏览器逐项检查六家选项、官方主机显示、密钥/模型输入及保存入口通过；未发起真实供应商调用。
- 移动版前端构建及产物模式/资源/服务工作线程标记检查通过。构建仍有项目既有的大分包及动态导入警告。
- 没有生成新 APK，没有进行真实账户、付费调用或 Android 真机验收。
