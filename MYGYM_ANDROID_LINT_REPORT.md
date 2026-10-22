# Android lint 与待提交核验

日期：2026-10-22（Asia/Shanghai）。分支 `custom-lite`，提交基线 `fe29fb5b`。

## 最终结果

- `:app:testDebugUnitTest :app:lintDebug --offline --no-daemon --max-workers=1`：`BUILD SUCCESSFUL`。
- Android lint：**0 errors, 29 warnings**。包含应用、原生测试及插件分析，没有创建忽略 baseline 或关闭全局检查。
- 原生单元测试：8 项，0 失败、0 错误（休息提示音 7 项、原工程示例 1 项）。
- 当前前端完整回归：413 文件、5103 项断言全部通过；Node 22，测试进程 UTC，最多 2 worker。
- `git diff --check` 通过。

## 修复内容

首次完整 lint 有 10 个错误、29 个警告：

| 检查 | 处理 |
|---|---|
| 备份清理 List.sort 需要 API 24 | 使用 API 23 支持的 Collections.sort，比较器不变 |
| Health Connect 时间 API 需要 API 26（6 处） | 时间转换方法内明确保护 Android 9 以下系统，符合插件原有最低可用系统约定 |
| 基础主题使用新系统刘海屏属性 | 移到 values-v28/styles.xml，保留主题的其他设置 |
| 相机权限隐含强制硬件要求 | 相机及自动对焦声明为可选 |
| 精确闹钟权限被当作系统专用 | 仅对该声明的 ProtectedPermissions 误报作局部标记，附官方依据，保留 canScheduleExactAlarms 判断 |

精确闹钟是用户可授予的特殊访问权限，普通应用可以声明 SCHEDULE_EXACT_ALARM。依据：[Android 官方闹钟文档](https://developer.android.com/develop/background-work/services/alarms)、[Android 14 默认拒绝授权说明](https://developer.android.com/about/versions/14/changes/schedule-exact-alarms)。没有抑制其他 API 或权限错误。

## 保留的 29 个警告

| 类型 | 数量 | 处理 |
|---|---:|---|
| GradleDependency | 4 | 保持现有兼容工具链，本次不升级依赖 |
| InlinedApi | 5 | 通知 importance 整数常量；常量内联，通知通道仍受版本保护 |
| AcceptsUserCertificates / InsecureBaseConfiguration | 各 1 | 保留自托管用户 CA 与 HTTP 支持；正式分发阶段再确定网络策略 |
| ManifestOrder / UnusedAttribute | 各 1 | 现有 manifest 顺序及低版本忽略网络配置属性提示 |
| IconDipSize / IconDuplicatesConfig / MonochromeLauncherIcon | 各 2 | 现有图标资源提示 |
| IconLocation / RtlSymmetry | 各 1 | 现有资源位置与布局提示 |
| UnusedResources | 8 | 保留原资源，本次不做资源删除 |

lint 通过不等于零警告，不代表正式发布要求或全部设备行为已验收。

## 过程与证据

使用临时英文盘符 Y、既有 JDK 21、Gradle 8.11.1、AGP 8.7.2。首次离线运行因 Capacitor 测试依赖未缓存停止；联网补齐原有 Maven 依赖后完整分析，未升级依赖。一次代理参数因 PowerShell 拆分失败，加引号后重试成功。修复后的最终复查使用离线模式成功。

日志在仓库上一级 `.local-tools/logs/`：

- android-lint-resume.log：离线缺依赖。
- android-lint-online.log：代理参数解析失败。
- android-lint-online-retry.log：完整分析，发现 10 个错误。
- android-lint-fixed.log：修复后原生测试、lint 成功。
- precommit-frontend-final.log：前端 413 文件、5103 项通过。

原生 HTML/XML 报告在 frontend/android/app/build/reports/lint-results-debug.html 及同名 XML，文本在 frontend/android/app/build/intermediates/lint_intermediate_text_report/debug/lintReportDebug/lint-results-debug.txt。归档副本在仓库外 `.local-tools/logs/`，前缀 android-lint-final-results，避免后续构建覆盖报告后丢失证据。

用户已确认安装使用原 Debug 包，暂未发现问题。本次原生修复发生在该反馈之后，不宣称修复版已做真机验证；未重打或替换 release-test 中已交付 APK。

待提交分组见 MYGYM_PENDING_CHANGES.md。本次不创建 Git 提交、不推送、不修改远程、不公开发布。正式签名、分发渠道、网络策略和更新方式仍待确定。
