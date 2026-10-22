# myGym 独立产品官网

基于原版 openGym 官网改造，保留原有无框架静态技术栈。入口 index.html；复用 styles.css 与上游 SVG 图标，产品布局在 mygym.css，本地交互在 mygym.js。

## 本地预览

在仓库根目录运行（Node.js 18+，无需 npm install）：

```powershell
node website/build.mjs
node website/preview.mjs
```

打开 http://127.0.0.1:4173 。Ctrl+C 停止。也可将 website/dist 交给任何静态 HTTP 服务。

## Cloudflare Pages

- 连接 myGym 仓库，选择包含本次改动的分支。
- 根目录：仓库根目录；构建命令：`node website/build.mjs`。
- 输出目录：`website/dist`；无需环境变量、后端、数据库或 Functions。
- 不要直接发布整个仓库或 website 源目录。构建使用明确的允许清单，排除上游 about.html、api.html、docs.html、site.js、llms.txt、sitemap.xml 与 build-images.sh；这些旧文件保留作源资料，非官网入口。
- 域名确定后再添加 canonical、og:url、绝对社交分享图与 sitemap。当前不冒用 opengym.ch 域名。
- _headers 提供基本安全响应头；正式部署后验证 MIME、缓存、锚点和图片路径。

## 页面与素材

完成首屏、核心功能、五张真实界面、六项版本对比、开发历程、技术栈、源码/安装、致谢及页脚。桌面单手机首屏，移动端菜单、横向截图和可访问的放大对话框。

界面截图为当前应用 Web 界面加演示数据；未包含 Gym visual 动作媒体。详见 assets-notice.md。代码 LICENSE 和完整 NOTICE 按原文随站点分发。无需加载远程脚本或统计。

## APK 与待补充内容

当前没有公开下载地址。首页明确显示“公开下载暂未开放”，不链接原版 APK，不复制本地 release-local 产物。今后正式发布时，替换状态文字为已经验证的 HTTPS 下载链接，并提供版本、文件大小、SHA-256、签名指纹和对应源码。先验证首次迁移及同签名覆盖更新。

待补：正式域名、公开 APK 的发布决定和地址、独立品牌图标，以及可选的 Android 真机截图。中文机器译文尚需人工校对，旧器械配置限制已在页面披露。

## 验证

检查记录与本地浏览器截图见工作区 .local-tools/logs/website-*。改动范围限定为官网，不修改 App 业务逻辑和个人主页。Git 提交与发布按用户明确指令执行。

最终检查：2026-10-22 已通过浏览器测试，1440/1024/768/390/320px 无整页溢出；5 个截图对话框、移动菜单、13 个锚点、图片及许可证请求均正常；无控制台错误和失败资源请求。通过 GitHub API 只读核实目标仓库公开可访问（HTTP 200，默认分支 main）。已查看桌面与移动端整页截图。
