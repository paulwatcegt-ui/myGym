# myGym 待提交改动

基于 `custom-lite` 的 `fe29fb5b`，整理日期 2026-10-22。

## 建议提交分组

### 1. Android 个人测试构建

建议标题：`feat: prepare independent myGym Android test build`

- 独立 applicationId `io.github.paulwatcegt_ui.mygym`；Debug 追加 `.test`，namespace 和存储结构保留。
- 关闭原版更新检查、下载和安装；移除安装权限及安装插件注册。
- 设置搜索区分网页两个 Android 入口，使用实际显示标题定位搜索结果。
- Node 跨平台移动构建脚本，支持仅同步 Android 或 iOS；本地 Android 环境辅助脚本。
- 保留原工程 Gradle/AGP 版本，统一插件使用的 AGP，并适配中文 Windows 路径。
- `.gitignore` 排除本地 APK 与签名材料。
- 对应文件：Android 配置、Capacitor 配置、前端 package.json、build-mobile.mjs、update 模块及测试、Settings 与 settings-pages 及测试、use-android-env.ps1、阶段报告。

### 2. 累计训练时长

建议标题：`fix: keep accumulated training time compact and consistent`

- 保留既有小时/日/年压缩规则和无分组数字，适应窄屏卡片。
- 缺失有效时长时使用统一占位符 `–`。
- 对应文件：training-time.js、training-time.test.js、Home.training-time.test.jsx。

### 3. 回归检查与文档

建议标题：`test: align regression checks with myGym customization`

- 移动包诊断测试兼容 Windows 分隔符。
- 动作分页和卡片测试适配已有管理入口。
- 品牌提示、源码链接、Android 身份断言与当前功能一致；保留原版权和技术路径。
- 葡语继承指纹包含已审阅的英文回退文案。
- 对应文件：其余本次变更的测试、MYGYM_CHANGELOG.md、MYGYM_RESUME_REPORT.md、本文件，以及后续 lint 核验记录。

### 4. Android lint 兼容修复

建议标题：`fix: resolve Android lint compatibility errors`

- 备份清理排序使用 Android 6 支持的 `Collections.sort`，保留原比较顺序。
- Health Connect 时间转换辅助方法增加 Android 9 版本保护，保持低版本不可用的原有约定。
- 刘海屏样式放入 `values-v28/styles.xml`；旧系统继续使用基础主题。
- 相机及自动对焦声明为可选功能。
- 精确闹钟权限的系统专用误报仅在该声明处标记，附官方说明；保留 `canScheduleExactAlarms` 判断，不关闭全局规则、不创建 baseline。
- 对应文件：BackupFolderPlugin.java、HealthConnectPlugin.java、AndroidManifest.xml、基础与 v28 styles.xml、lint 核验报告。

### 5. 本地正式签名与手动更新

建议标题：`build: add fixed-key local Android release workflow`

- 用户确定固定密钥、本地自己保存、手动 APK 覆盖更新。
- Gradle Release 签名从当前进程环境读取；versionCode 提高到 27。
- build-release.ps1 校验证书指纹、打包移动资源、执行 Release lint、核验 APK 后保存在忽略的 release-local 目录。
- 正式私钥与随机密码在仓库外的受限目录，不提交；源码仅保存公开证书指纹。
- 首次从 Debug .test 包导出/导入数据，后续正式版保持包名和密钥并递增版本号。
- 对应文件：build-release.ps1、release-signing-certificate.sha256、Gradle 签名配置、.gitignore、MYGYM_RELEASE_GUIDE.md 及本地正式构建报告。

建议分组供评审使用，不等于已经创建这五条提交。当前不推送、不公开分发；按用户确认方案仅建立本地正式签名和手动更新流程。

## 产物与数据

测试 APK 仍在本地 `release-test/`；SDK、JDK、缓存和日志位于仓库外 `.local-tools/`。这些内容及运行数据、签名密钥不属于待提交源码。现有 APK 不因源码整理而自动更新。

用户已确认下载安装包并使用，暂未发现问题；完整测试证据及限制以阶段报告和续接记录为准。
