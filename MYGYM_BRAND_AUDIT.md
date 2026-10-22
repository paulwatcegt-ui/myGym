# myGym 品牌文案检查与修正报告

## 检查范围与边界

检查本地 README、根目录项目说明、frontend 网页/PWA/Capacitor/Android/iOS 配置、运行时翻译、导出页面、API 配置、docs、website、GitHub 模板及 Git 路径历史。先完成只读检查，再实施以下必要文案修正。保留既有未提交的图文说明和配图。

不修改业务流程、数据格式、存储路径、包标识、认证 RP_ID、功能或界面布局。不安装依赖，不重写历史，不提交或推送。不修改 LICENSE、NOTICE.md、CLA.md、第三方媒体声明和历史 CHANGELOG。

## 只读检查结果（修改前）

| 文件路径 / 位置 | 当前内容 | 建议 | 是否必要 |
| --- | --- | --- | --- |
| README.md：开头、介绍、Android 章节 | myGym；来源说明引用 openGym；注明尚无 APK 附件 | 保留，增加图文说明入口 | 品牌已正确；入口可改善资料查找 |
| frontend/index.html：title、Apple 标题 | myGym | 保留 | 否 |
| frontend/public/manifest.json；frontend/capacitor.config.json | name / short_name / appName 均为 myGym | 保留 | 否 |
| frontend/android/app/src/main/res/values/strings.xml | app_name、title_activity_main 为 myGym | 保留；不改 package_name、custom_url_scheme | 否 |
| frontend/ios/App/App/Info.plist：CFBundleDisplayName | openGym | myGym | 是：安装显示名称 |
| frontend/ios/App/App/PrintPlugin.swift：jobName 默认值 | openGym | myGym | 是：系统打印任务标题 |
| frontend/src/lib/plan-share.js：打印 HTML 页脚 | Made with myGym（翻译后）· opengym.ch | 保留翻译键，网址改为 myGym 仓库 | 是：分享产物的归属 |
| api/server.js；.env.example；contrib/nix/opengym.nix | RP_NAME / rpName 默认 openGym | 默认显示名 myGym，保留 RP_ID、origin 与配置字段 | 是：通行密钥系统提示 |
| frontend/src/lib/product-copy.js；locales/*.js；界面调用 t(...) | 旧名称翻译键；已审阅键在插入用户参数前转换为 myGym | 保留键和词典，不做全局替换 | 否：原文命中不等于实际显示旧品牌 |
| frontend/src/views/Settings.jsx：关于 | 两个下载/仓库入口明确标注 openGym、myGym；原项目及媒体许可说明 | 保留明确区分的上游入口与声明 | 否：这里确实指向原版，不应假称 myGym 下载 |
| frontend/src/lib/mobile.js；BackupFolderRow.jsx；媒体与同步模块 | Documents/openGym、opengym-state.json、opengym_plan 等 | 保留 | 否：兼容性路径和格式标识，不是产品宣传 |
| frontend/package.json / lock；API/MCP/容器/Kubernetes 技术名称 | opengym-frontend、opengym-api 等 | 保留内部标识 | 否：避免无关配置变化 |
| docs/README.md | openGym documentation，原版演示及支持入口 | 标题改为 myGym 文档导航，说明继承文档边界，优先指向 myGym 资料 | 是 |
| docs/*.md（除索引）；mcp/README.md；helm/README.md；catalogue/README.md；CONTRIBUTING.md；SECURITY.md；ROADMAP.md | 原版操作指南、发布承诺、支持渠道和路线图 | 顶部明确标记上游资料，myGym 安装和更新以当前说明为准；原版路线图不构成 myGym 承诺 | 是：避免误读；保留原版技术叙述 |
| docs/FAQ.md；docs/MOBILE.md | 原版 APK 链接、自动更新及 CI 签名发布说明 | 保留为上游参考，顶部特别注明 myGym 手动更新且无公开 APK 附件 | 是：避免下载错应用 |
| website/index.html / about.html / docs.html / api.html | openGym 标题、原作者自述、原版下载/域名/社交/发布信息 | 保留上游网站作为来源资料，页首和标题明确标记，并链接 myGym；不把原作者经历和网站改名冒充自己的 | 是：明确归属；不伪造 myGym 官网或下载渠道 |
| website/README.md；website/llms.txt | 原版网站资料索引 | 明确上游资料身份，指向 myGym 当前仓库 | 是 |
| scripts/build-api-docs.mjs | 生成原版网站 API 页面 | 在生成模板同步加入上游资料标识，重新生成 api.html | 是：避免手工改生成物后被覆盖 |
| .github/ISSUE_TEMPLATE/bug_report.yml、feature_request.yml | Something in openGym… / improvement for openGym | 当前项目名称替换为 myGym | 是 |
| .github/ISSUE_TEMPLATE/config.yml | 未注明归属的原版 Discussions / 贡献入口 | 上游讨论显式标注 openGym；本仓库贡献指南指向 myGym | 是：不假设 myGym 已开通 Discussions |
| .github/FUNDING.yml、原作者网站与赞助链接 | 原作者赞助配置与账户 | 保留；不将它们描述为 myGym 的账户 | 否：不擅自更改资金去向 |
| api/openapi.yaml；website/api.html | openGym API 1.4.1 | 保留继承协议版本与原版规范说明；文档页明确上游身份 | 否：不把 API 版本误改成应用版本 |
| LICENSE、NOTICE.md、catalogue/media/NOTICE.md、CLA.md | openGym、原作者和媒体授权范围 | 原样保留 | 必须保留 |
| MYGYM_* 历史报告及比较说明；CHANGELOG.md | 基准、来源、历史状态中的 openGym | 原样保留 | 必须保留准确来源和历史 |
| assets/banner.*、social.jpg、旧截图 | 原版品牌图或原版界面 | 保留来源素材；当前 README 已不使用原版横幅，新增 myGym 图文说明单独配图 | 否：不伪造截图、不改写历史素材 |

## GitHub 文件列表旧说明的来源

GitHub 文件/目录行里的说明来自该路径最近相关提交的提交信息，不是文件内容、README、GitHub 仓库 Description，也不是能单独编辑的文本字段。

只读核对：当前 HEAD 为 f9b74424；frontend/ 最近提交为 0e866655（prepare signed myGym Android releases and manual updates），website/ 最近提交为 464355ef（Release v1.4.1: bug fixes for v1.4.0）。因此 website/ 行显示原版发布说明是正常历史表现。

以后只有发生真实内容修改、创建实际提交并推送到 GitHub 所查看分支后，对应路径行才可能显示新的提交说明；未被修改的其他路径仍可显示原版信息。目录行通常取目录内最近相关提交。不同分支/标签显示各自历史，旧标签仍保留旧说明。本地未提交修改不会改变 GitHub，也不应创建空文件、无意义变更、空提交或重写旧提交来刷新文字。

## 修正与验证

具体修正文件、验证结果将在本次检查结束后补充。原版来源、版权、许可与完整 Git 历史保持不变。

### 复查补充

| 文件 | 修改前 | 处理 |
| --- | --- | --- |
| frontend/src/lib/fit-export.js | FIT device_info 的产品名 openGym | 改为 myGym；字段号、格式和宽度不变 |
| frontend/src/lib/fit-export.test.js | 导出产品名断言 openGym | 仅同步当前产品名断言及用例标题；原版字符串的编解码样本保留 |
| api/coach/prompts/common.md | coaching engine inside openGym | 仅改产品名 myGym，教练指令与行为约束保留 |
| mcp/package.json；mcp/src/tools.js；mcp/src/state.js | 外部客户端读取的产品说明及诊断文字 openGym | 改为 myGym；工具名、命令、环境变量和数据读取逻辑不变 |

### 已完成修正

- 当前产品显示：iOS 安装显示名、默认打印任务名、计划打印页脚、FIT 导出产品名和通行密钥注册默认提示名统一为 myGym。
- 项目入口：README 增加用户图文说明链接；Issue 模板改称 myGym；上游讨论入口明确标识 openGym。
- 文档归属：docs 索引优先展示 myGym 资料，其余继承指南在顶部说明边界；FAQ/MOBILE 特别指出原版 APK 与 myGym 不同、myGym 手动更新。
- 上游网站：保留作者自述、原版链接、版权、赞助、截图与历史内容，加入页首来源提示，并在页面标题和分享标题标记为 myGym 仓库中的上游资料；没有虚构 myGym 官网或 APK 下载地址。
- 生成物：修改 scripts/build-api-docs.mjs 模板后重新生成 website/api.html，没有只改生成文件。
- API 规范的 openGym API 1.4.1 保留为继承协议说明，没有将应用版本冒充协议版本。
- 原版版权、媒体授权、存储路径、内部包名、历史变更记录、既有图文说明及配图均保留。

### 验证结果

- 前端现有测试：7 个测试文件、97 项通过（品牌转换/来源保留、计划分享与打印、设置重置与更新、FIT 导出、备份媒体）。其中 FIT 测试仅更新当前导出产品名断言，原版编解码样本未删除。
- MCP 工具及标签现有测试：84 项通过、4 项失败。使用临时 Vite 插件只读加载 HEAD 中原始 tools.js/state.js，其他输入和测试不变；对照仍为相同 4 项失败。因此这些失败在修改前即可复现，未修改业务逻辑去消除失败。
- 失败项：教练周首个待做 session、固定日期 session、用户常规训练与教练训练并列、最新训练日期预期。当前测试期望与演示状态不一致；本次不对其最终根因作未验证判断。
- API 页面生成及 --check 一致性通过（69 个端点、30 个 schema）；没有更改端点或 schema。
- Issue 模板/OpenAPI YAML、项目 JSON、iOS plist XML 解析通过；API/MCP JavaScript 语法检查通过。
- 四个保留的上游网站页面均有且仅有一处来源提示，页面标题明确归属；docs 顶层指南均有 myGym 边界说明。
- git diff --check 通过；保护文件差异检查为空：许可证、媒体声明、CLA、锁文件、翻译键处理、存储模块、Android/PWA/Capacitor 已正确配置均未被改动。
- 初次前端测试受沙箱临时目录重命名权限影响，没有执行用例；将临时目录调整到工作区外置工具目录后重跑通过。
- API 文档生成起初缺少 js-yaml，离线缓存也缺失；随后按现有锁文件安装根目录两个构建依赖，禁用安装脚本，未变更 package.json/锁文件，再生成和校验成功。
- 未重新构建 APK、未进行 iOS/Android 真机测试、未运行全量服务端测试；iOS 名称修改仅通过配置/XML 检查，不等同于 iOS 安装验收。
- 本地旧 APK、frontend/dist 和 Android 已同步的打包资源不直接编辑；要让已安装应用出现本次新文案，需要后续重新构建/分发。既有 APK 不会随源码文案自动变化。
- 当前 HEAD 仍为 f9b744240783c222ecbbe2b6e7fbe49fbad48d65，暂存区未变；未执行 Git 提交、标签、历史重写或推送。

### 本次修改的文件（相对于仓库根目录）

以下为本次实际内容变更；既有未跟踪的 MYGYM_CHANGELOG_DETAILED.md、MYGYM_CHANGELOG_SHORT.md、MYGYM_USER_GUIDE.html 及 assets/mygym-guide/ 保留且未在本次修改。

- `.env.example`
- `.github/ISSUE_TEMPLATE/bug_report.yml`
- `.github/ISSUE_TEMPLATE/config.yml`
- `.github/ISSUE_TEMPLATE/feature_request.yml`
- `CONTRIBUTING.md`
- `README.md`
- `ROADMAP.md`
- `SECURITY.md`
- `api/coach/prompts/common.md`
- `api/server.js`
- `catalogue/README.md`
- `contrib/nix/opengym.nix`
- `docs/AI_COACH.md`
- `docs/API.md`
- `docs/DATA_IMPORTS.md`
- `docs/FAQ.md`
- `docs/MOBILE.md`
- `docs/NIX.md`
- `docs/README.md`
- `docs/SELF_HOSTING.md`
- `docs/SELF_HOSTING_HTTPS.md`
- `docs/SELF_HOSTING_KUBERNETES.md`
- `frontend/ios/App/App/Info.plist`
- `frontend/ios/App/App/PrintPlugin.swift`
- `frontend/src/lib/fit-export.js`
- `frontend/src/lib/fit-export.test.js`
- `frontend/src/lib/plan-share.js`
- `helm/README.md`
- `mcp/README.md`
- `mcp/package.json`
- `mcp/src/state.js`
- `mcp/src/tools.js`
- `scripts/build-api-docs.mjs`
- `website/README.md`
- `website/about.html`
- `website/api.html`
- `website/docs.html`
- `website/index.html`
- `website/llms.txt`
- `MYGYM_BRAND_AUDIT.md`（本报告，新增）
