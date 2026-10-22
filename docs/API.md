# HTTP API

> **myGym 文档说明：** 下文继承自上游 openGym，保留其技术说明和来源。文中的 openGym 网站、演示、下载、支持渠道及版本计划属于原项目，不代表 myGym 的发布或服务承诺。myGym 的当前功能见 [项目首页](../README.md)，安装与手动更新见 [正式版说明](../MYGYM_RELEASE_GUIDE.md)。

The complete openGym HTTP API — every route of `api/server.js`, with auth,
request/response schemas and the env-dependent behavior — is documented as a
hand-written OpenAPI 3.1 spec:

- **Spec (source of truth):** [`api/openapi.yaml`](../api/openapi.yaml)
- **Browsable (Swagger UI):** https://opengym.ch/api.html

Lint it after changing routes:

```sh
npx --yes @redocly/cli lint api/openapi.yaml
```
