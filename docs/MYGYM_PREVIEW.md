# myGym 本地调试与 Android 一致性

## 启动

在 frontend 目录执行：

- npm run dev：默认独立移动版界面，与 APK 的 VITE_MOBILE=1 分支一致。
- npm run dev:mobile：显式选择上述模式。
- npm run dev:web：显式选择自托管网页版，用于登录及服务端调试。

直接运行 vite 开发服务器也默认移动版。显式 VITE_MOBILE=0、--mode web 或 VITE_DEMO=1 会选择其他目标；日常 Android 界面调试不要使用这些覆盖项。npm run preview 展示已经构建的产物，不会把旧 Web 构建自动改成移动版。

## 验收范围

关于页各模式共用同一内容：版本、myGym 介绍、来源和许可说明。已去除 APK 下载行、浏览器安装提示及对应设置搜索结果。

其他页面在默认预览中使用现有移动版分支，包括本地使用/连接服务器、训练、计划、动作库和统计。首次打开无数据时可看到与移动版相同的引导，选择本地使用即可进入。

isAndroid() 仍检查真实原生平台。健康数据、系统备份目录、原生通知、分享/打印、震动及权限不能靠桌面浏览器完全验收；不强行伪造 Android 环境。浏览器与手机的数据互不自动复制，使用测试数据或主动导入备份。

## 防止再次混用

配置统一由 scripts/app-flavor.mjs 决定，Vite 的运行时标志和 HTML 中 opengym-flavor=mobile 标记共用同一个结果。

前端现有测试命令自动覆盖 app-flavor.test.js、Settings.update.test.jsx 和 settings-pages.test.jsx。移动包继续由 build:mobile 显式设置 VITE_MOBILE=1，并执行 check-mobile-bundle.mjs 检查打包产物。新增平台专属入口需同时验证浏览器预览、Android 原生及设置搜索；系统能力差异必须单独记录。

本次改动不会自动更新手机里已经安装的 APK，也不承诺桌面浏览器能替代原生验收。
