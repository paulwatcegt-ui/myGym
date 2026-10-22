# myGym 独立产品官网

基于原版 openGym 官网改造，保留原有无框架静态技术栈。入口 index.html；从 styles.css 提取实际使用的基础样式到 base.css，保留所需上游 SVG 图标；产品布局在 mygym.css，本地交互在 mygym.js。原始 styles.css 保留作上游资料，不再发布。

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
- 不要直接发布整个仓库或 website 源目录。构建使用明确的允许清单，排除上游 about.html、api.html、docs.html、site.js、styles.css、llms.txt 与 build-images.sh；这些旧文件保留作源资料，非官网入口。
- 当前 canonical、社交元数据与 sitemap 使用 https://mygym-ckr.pages.dev/。若以后绑定正式域名，应统一更新 index.html、robots.txt 和 sitemap.xml。
- _headers 提供基本安全响应头；正式部署后验证 MIME、缓存、锚点和图片路径。

## 页面与素材

完成首屏、核心功能、五张真实界面、六项版本对比、开发历程、技术栈、源码/安装、致谢及页脚。桌面单手机首屏，移动端菜单、横向截图和可访问的放大对话框。

界面截图为当前应用 Web 界面加演示数据；未包含 Gym visual 动作媒体。详见 assets-notice.md。代码 LICENSE 和完整 NOTICE 按原文随站点分发。无需加载远程脚本或统计。

## APK 下载

官网按钮直接链接现有仓库 GitHub Releases 的 v1.0.0 正式 APK，不跳转原版 openGym 下载。安装包 222423926 字节（212.1 MiB），最低 Android 6.0，包名 io.github.paulwatcegt_ui.mygym，versionCode 27。文件 SHA-256 与签名证书已核实，页面提供校验信息、对应标签源码及迁移说明。

下载地址：https://github.com/paulwatcegt-ui/myGym/releases/download/v1.0.0/myGym-v1.0.0-code27-release.apk

APK 大于 Cloudflare Pages 单文件 25 MiB 限制，也不适合 Git 普通文件存储，因此只作为 Release 附件发布，不纳入官网构建产物或 Git。website/.local-downloads/ 为被忽略的本地校验副本，不由预览服务分发。

后续版本应先验证 APK 签名、包名、版本、文件哈希和对应源码，再发布新附件，最后修改页面的下载地址、大小和校验值。不要覆盖现有版本附件。网页触发下载，安装需由用户在 Android 系统中确认。

待补：可选的自定义域名、独立品牌图标，以及可选的 Android 真机截图。中文机器译文尚需人工校对，旧器械配置限制已在页面披露。

## 验证

检查记录与本地浏览器截图见工作区 .local-tools/logs/website-*。改动范围限定为官网，不修改 App 业务逻辑和个人主页。Git 提交与发布按用户明确指令执行。

最终检查：2026-10-22 已通过浏览器测试，1440/1024/768/390/320px 无整页溢出；5 个截图对话框、移动菜单、13 个锚点、图片及许可证请求均正常；无控制台错误和失败资源请求。通过 GitHub API 只读核实目标仓库公开可访问（HTTP 200，默认分支 main）。已查看桌面与移动端整页截图。

APK 下载接入验证（2026-10-22）：官方 apksigner 验证通过，证书与固定指纹一致；aapt 核对包名、版本及最低 Android 版本；未登录 GitHub API 确认 v1.0.0 Release 已公开、APK 与 SHA-256 附件已上传，APK 服务端哈希与原文件一致。1440/768/390/320px 布局、校验信息展开和按钮目标请求通过，无页面脚本错误。当前网络对 GitHub 下载域名连接超时，未完成从公网完整重下 APK 的端到端验证；不将 API 元数据验证等同于完整下载验证。记录位于 .local-tools/logs/website-download-check.json。

## 分享、资源与无障碍优化

- 增加 1200×630 的本地分享图、Open Graph、Twitter Card、canonical 和中文 locale；补充已有项目图标的 apple-touch-icon 与 192px 声明，不增加 PWA 安装行为。
- sitemap.xml 只列出官网根地址；404.html 为真实缺失页面，Cloudflare Pages 不再把任意未知地址回退到首页。本地预览同步验证 404 状态、XML MIME 和安全头。
- base.css 从上游样式中提取基础规则，从 43934 字节缩至 3746 字节；保留原文件与许可证，避免影响上游资料页。删除首页 18 个未使用 SVG symbol，保留 7 个实际使用的图标。
- 原始 PNG 保留在源码中；正式构建仅包含 image-assets.json 列出的带内容哈希 WebP/JPEG。完整截图使用无损 WebP（原像素不变），由 671044 字节缩至 277758 字节；另提供 360px 缩略图与 srcset/sizes，灯箱读取大图。分享图为 45545 字节。
- 构建为 CSS/JS 生成内容哈希文件名，只有 /assets/ 与带哈希的 /img/ 资源使用一年 immutable 缓存；HTML 保持重新校验。构建会清理经路径核对的 website/dist 后重新生成，不会复制 APK 或本地下载副本。
- 将唯一内联 style 移入样式类，CSP style-src 收紧为 self；不新增第三方字体、脚本、统计或额外运行依赖。
- 导航增加下载与开源致谢；菜单符号不读屏，Escape 关闭展开菜单并归还焦点；手机截图区增加滑动提示；提高序号、箭头、侧注对比度与页尾小字字号。
- 资产生成在本地利用已有图片工具完成，生成结果随源码提供；部署只需 Node 标准库，无需安装图片依赖。替换截图时需更新对应图片、内容哈希文件名及 image-assets.json/index.html 引用。

验证记录：.local-tools/logs/website-optimization-check.json。社交平台最终预览和 Cloudflare 实际响应头需在这些改动部署后复查；本地结果不等同于线上已生效。

## 首次访问位置

entry.js 在页面内容解析前处理首次访问与刷新：清除入口锚点并禁用该次滚动位置恢复，让用户先看到产品首屏。页面内下载/导航锚点仍正常使用，不在滚动或点击后强制回顶；浏览器 back_forward 文档导航不执行入口重置。入口脚本与其他 JS 一样由构建生成哈希文件名，并符合 script-src self。较矮桌面屏幕采用紧凑首屏尺寸。验证记录：.local-tools/logs/website-entry-check.json。
