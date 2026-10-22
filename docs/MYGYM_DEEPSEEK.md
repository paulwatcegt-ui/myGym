# 在 myGym 使用 DeepSeek

## 手机端或本地移动版预览

1. 打开 AI 教练设置，选择使用自己的 API 密钥。
2. 供应商选择 **DeepSeek API**。
3. 输入在 DeepSeek 开放平台创建的 API 密钥。
4. 点击列出模型，选择账户实际可用的模型，再保存并启用教练。

已预设官方地址 https://api.deepseek.com，无需手填接口地址。默认模型为文档核对时的 deepseek-flash，模型选择器以接口返回的列表为准，不把所有账户都能调用某个模型作为保证。

切换供应商会清空尚未保存的密钥输入；已保存的密钥只在同一供应商下复用。密钥沿用项目原有安全存储机制，不加入训练状态或备份。浏览器不等同于 Android 安全存储环境，请优先在手机验证真实密钥。

手机端自带密钥模式可以直接请求 DeepSeek，不需要先部署 myGym 服务端。实际发出的训练数据类别在配置页列出；使用会遵循 DeepSeek 的账户权限和计费规则。

## 自托管服务端

共享供应商列表和服务端适配器也已注册 DeepSeek，可通过原有教练管理配置选择并保存凭据。浏览器客户端与服务端通过既有教练流程工作，不新增公开密钥接口。

## 适配与验证边界

使用官方 Chat Completions、Bearer 鉴权及模型列表接口。结构化教练输出采用 JSON object 和 max_tokens，显式关闭默认思考模式；仍经项目原有解析及提案校验后才呈现修改建议，不会因新增供应商绕过确认流程。

自动测试使用模拟响应验证模型列表、鉴权、请求格式、缺失密钥、鉴权失败、输出截断、手机请求通道和配置保存；没有使用真实密钥进行付费调用。桌面浏览器能否直连还取决于供应商的 CORS 策略；Android 沿用原生 HTTP 通道，仍需真机验证。

已安装的 APK 不会随源码自动新增供应商，需要重新构建并安装包含本次代码的版本。

官方依据（核对日期：2026-10-22）：

- [首次调用与官方地址](https://api-docs.deepseek.com/)
- [模型列表](https://api-docs.deepseek.com/api/list-models/)
- [JSON 输出](https://api-docs.deepseek.com/guides/json_mode/)
- [思考模式](https://api-docs.deepseek.com/guides/thinking_mode/)
