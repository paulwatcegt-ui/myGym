# myGym Android 第一阶段构建报告

检查与构建日期：2026 年 10 月 22 日。范围：本地个人 Debug 安装测试准备，不是正式公开发布。

## 一、代码保护与 Git 状态

- 分支：`custom-lite`。
- 开始时最新提交：`fe29fb5bbfb7cbc25400df72c5e6a92cc0963554`。
- 开始时的三个未提交文件为 `MYGYM_CHANGELOG.md`、`frontend/src/lib/training-time.js`、`frontend/src/lib/training-time.test.js`。三者已单独进行备份哈希校验；没有重置或覆盖。
- 本地备份：`D:\CodexWork\基于openGym的二次开发\local-backups\myGym-before-android-stage1-20261022-001037`。包含 `.git`、源码及未跟踪测试；排除可重新生成的依赖、构建输出和缓存。
- `origin` 仍为 `https://github.com/paulwatcegt-ui/newopenGym.git`，与目标 `https://github.com/paulwatcegt-ui/myGym` 不同。本阶段只检查，未修改远程、提交、合并或推送。
- 用户确认没有需要延续升级能力的 myGym 正式版本，因此允许采用独立包名。

## 二、实际修改

| 文件或模块 | 修改与原因 |
|---|---|
| `frontend/capacitor.config.json`、`frontend/android/app/build.gradle` | 将基础 applicationId 改为 `io.github.paulwatcegt_ui.mygym`；名称 myGym、版本 1.0.0、versionCode 26 不变。保留原有 debug 的 `.test` 后缀，测试包有独立数据空间。 |
| `frontend/src/lib/update.js` | 移除原版更新服务器、下载和安装实现。旧导出保留为安全空结果或明确拒绝，不进行网络请求。未开发新的自动更新系统。 |
| `frontend/src/views/Settings.jsx` | 移除 Android 更新检查、下载、确认安装和进度处理；保留备份目录需要的平台识别。网页原版与修改版下载链接保留，原生页面不展示 APK 入口。 |
| `frontend/src/views/settings-pages.js` | 删除已关闭更新功能的搜索入口；将网页下载搜索项与实际两个品牌按钮同步，使用翻译参数区分。 |
| `frontend/android/app/src/main/AndroidManifest.xml` | 移除无其他用途的 `REQUEST_INSTALL_PACKAGES`。 |
| `frontend/android/app/src/main/java/ch/duartesantos/opengym/MainActivity.java` | 不再注册原生 APK 安装插件；保留原插件文件及其他插件。 |
| `frontend/package.json`、`frontend/scripts/build-mobile.mjs` | 使用 Node 顺序调用本地 Vite、媒体打包、Capacitor 和完整性检查，兼容 Windows；允许指定只同步 Android。 |
| `frontend/android/build.gradle` | 将子项目请求的 AGP 统一为工程原有 8.7.2；安全存储插件原先自行请求 8.13.0，与保留 Gradle 8.11.1 的目标不一致。不修改 node_modules，不升级 Capacitor 或 npm 依赖。 |
| `frontend/android/gradle.properties`、`use-android-env.ps1` | 配置本地 JDK/SDK/缓存及中文 Windows 工作区路径检查的兼容选项；只影响当前终端，不修改系统 PATH。 |
| `frontend/src/lib/update.test.js`、`frontend/src/views/Settings.update.test.jsx` | 验证无网络更新检查、无安装入口，直接调用更新函数也不能下载或安装。 |
| `frontend/src/views/settings-pages.test.jsx` | 验证搜索标题与真实按钮一致，并验证 myGym 下载搜索项导航。 |
| `.gitignore` | 忽略本地测试 APK 目录和签名材料，避免误入源码提交。 |
| 本报告、`MYGYM_CHANGELOG.md` | 记录阶段结果及限制；原有改动记录保留。 |

Java namespace、源码包路径、原图标、配色、训练数据文件名及存储结构没有改变。新的 applicationId 不会自动读取原版或网页的数据；不要卸载原版来迁移数据。

## 三、构建环境

| 组件 | 实际状态 |
|---|---|
| Node.js / npm | 工作区既有 22.23.3 / 11.6.2 |
| JDK | Eclipse Temurin 21.0.12.1+1，官方 ZIP 下载，校验官方 SHA-256 后解压到 `.local-tools/jdk21/` |
| SDK 命令行工具 | Google 官方 Windows 工具，校验官方 SHA-256；用户已明确同意 SDK 协议 |
| SDK Platform | Android 35 |
| Build Tools | 35.0.0 |
| Platform Tools | 37.0.1 |
| Gradle / AGP | 既有 Wrapper 8.11.1 / 工程 AGP 8.7.2 |
| Android Studio | 未安装；本次采用官方命令行工具构建，不需要 IDE 才能生成 APK |
| 工具和缓存位置 | 仓库上一级 `.local-tools/`，不写入项目依赖版本配置 |
| 模拟器及设备 | 未安装模拟器、没有连接 adb 设备；虚拟化检查未显示可用条件，未修改 BIOS/Windows 功能 |

官方下载入口：[Android Studio 与 SDK](https://developer.android.com/studio)、[Temurin JDK 21](https://adoptium.net/temurin/releases/?version=21&os=windows&arch=x64)。若以后需要 IDE，可安装 Android Studio，再在 SDK Manager 选择本工作区 SDK，Gradle JDK 选择 JDK 21；不要接受无关工具链升级。

下载采用当前本机代理。发生过 Gradle 直连超时、Maven TLS 握手失败；重试时降低并发并使用 TLS 1.2，未禁用 HTTPS 或证书校验，未改用非官方 Maven 镜像。

## 四、构建及核验结果

**Debug APK 已成功生成并复制，签名和 APK 内容核验通过。未做真机或模拟器安装测试。**

| 核验项 | 实际结果 |
|---|---|
| 文件完整路径 | `D:\CodexWork\基于openGym的二次开发\openGym\release-test\myGym-v1.0.0-debug.apk` |
| 大小 | 238,553,194 字节，约 227.5 MiB |
| APK applicationId | `io.github.paulwatcegt_ui.mygym.test`，沿用 Debug 后缀；正式基础包名为 `io.github.paulwatcegt_ui.mygym` |
| 名称 / 版本 | myGym / 1.0.0，versionCode 26 |
| 安装要求 | minSdk 23，targetSdk / compileSdk 35；包含 arm64-v8a、armeabi-v7a、x86、x86_64 |
| 启动 Activity | `ch.duartesantos.opengym.MainActivity`，保留 namespace 正常解析 |
| 签名 | Android Debug，RSA 2048，官方 apksigner 校验通过，v1/v2 签名有效；不是 Release 签名 |
| 证书 SHA-256 | `4185a258ff801d7ff7d7a1ee229434e16abddf6f1bab6a9c3bd0bae583458971` |
| APK SHA-256 | `080f0909419ff8cc63fd4521b06640739be45f2671f09777f332f5ce887cb9e5` |
| 移动产物 | APK 内 index.html 移动标记存在；包含 13,108 个动作图片/动画文件 |
| 更新隔离 | APK 中没有原版更新 API；最终权限中没有 `REQUEST_INSTALL_PACKAGES` |

校验文件保存在 APK 同目录的 `myGym-v1.0.0-debug.apk.sha256`。实际最终构建命令为 `:app:assembleDebug --max-workers=2`，结果 `BUILD SUCCESSFUL`。先前执行根级 `assembleDebug` 会额外构建插件产物，曾因某插件的 Maven 下载失败而返回失败；应用任务单独验证已成功，不能将两次命令混为一谈。

Gradle 自动生成的测试密钥位于工作区 `.local-tools/android-user/debug.keystore`。没有创建正式 Release 密钥。保留该测试密钥可方便后续同测试包名覆盖升级；不要将它作为正式签名或公开上传。

Windows 的 aapt 无法直接读取中文 APK 路径，因此核验时临时把本工作区映射为英文盘符 Y；没有移动源码或训练数据。官方 apksigner 在原完整路径签名核验成功。

原生单元测试和 lint 也通过该临时盘符执行。若以后遇到同类工具路径错误，可先确认 Y 盘未被占用，执行 `subst Y: "D:\CodexWork\基于openGym的二次开发"`，进入 `Y:\openGym` 后加载环境脚本并运行检查；完成且所有相关进程结束后回到原路径，再执行 `subst Y: /D`。这只移除临时盘符，不删除目录或文件。

本次出现的非阻断警告包括 Vite 大包/动态导入、Gradle flatDir、部分插件过时 API、SDK XML 元数据版本差异，以及多测试监听器数量警告。没有为了消除警告升级工具链或业务依赖。SDK XML 警告需要在正式环境复核，但没有阻止本次应用 Debug 构建。

从项目根目录复现移动构建的主要步骤：

```powershell
. .\use-android-env.ps1
Push-Location frontend
npm.cmd run build:mobile -- android
Pop-Location
.\frontend\android\gradlew.bat -p frontend/android :app:assembleDebug --max-workers=2
```

若需联网下载，应按本机实际 VPN/代理配置 Java 的 HTTP/HTTPS 代理；本次使用 127.0.0.1:7897，不把它固化为项目默认配置。资源检查日志为 `.local-tools/logs/android-stage1-mobile-build.log`，最终应用构建日志为 `android-stage1-gradle-build.log`，APK 核验日志为 `android-stage1-apk-badging.log`、`android-stage1-apk-signature.log`。

## 五、测试及尚未验证事项

1. 首批更新隔离、时长、统计、备份、原生提醒、密钥存储相关测试：13 个文件、92 项通过。
2. 补充设置搜索、教练、媒体备份、中文说明测试：初次 3 项失败，原因是原有搜索索引仍使用下载按钮的旧标题；修正索引与导航后 5 个文件、59 项通过。
3. 增加下载搜索导航回归后，更新及搜索相关 3 个文件、42 项通过。上述阶段包含重复用例，不能直接相加。
4. 与原生编译同时运行的大批回归曾出现提醒测试超时及随后注册次数断言失败；采用 `--maxWorkers=2` 后，完整的本阶段相关回归 **18 个文件、152 项全部通过**。未为通过测试修改提醒业务逻辑或放宽测试断言。
5. 移动前端构建、6554 张静态图与 6554 个动画打包、Android 同步及移动标记/资源完整性检查已通过。Vite 大包及动态导入警告不等同于构建失败。
6. 本阶段不将历史全量测试中的失败视为已解决，也不把单元测试当作 Android 实机验证。

Android 原有单元测试在中文路径下发生 `GradleWorkerMain` 类加载失败；使用临时英文盘符路径后，**8 项通过、0 失败**（其中 7 项为休息提示音测试，1 项为原工程示例）。没有修改原生测试源码。日志为 `android-stage1-native-checks-ascii.log`，JUnit XML 在 `frontend/android/app/build/test-results/testDebugUnitTest/`。

**Android lint 未完成，不计为通过。** 它与上述单元测试在同一命令中运行，单元测试已先完成；随后 lint 在本机长时间进行目录/源码环境扫描，未输出最终报告。诊断时系统可用内存曾低于 1 GB，线程仍处于文件读取/分析阶段，没有据此认定业务源码错误。清理本任务已经结束的空闲构建进程后仍未及时完成，因此在交付前主动停止本任务的辅助 lint 进程，终端最后的“daemon disappeared”是停止进程造成的，不能将其当作单元测试失败或通过的证据。没有放宽 lint 规则或生成忽略基线。正式 Release 前应在资源充足、英文路径的环境重新完整执行 `:app:lintDebug` 并审阅结果。

测试日志在仓库上一级 `.local-tools/logs/`：`android-stage1-tests.log`、`android-stage1-extra-tests.log`、`android-stage1-final-tests.log`、`android-stage1-regression.log`（含高并发失败）、`android-stage1-regression-limited.log`（最终通过）。

尚未在手机验证：首次启动、离线动作媒体、训练后重启恢复、锁屏提醒、精确闹钟拒绝、省电限制、相机、Health Connect、含媒体备份导入、AI 自带 Key 和服务器配对。

## 六、手机安装与验收

仅在第四节明确确认 APK 已生成并通过核验后执行：

1. 先从现有应用导出备份；有照片和视频时使用含媒体的 ZIP。不要卸载或清空原版。
2. 将核验后的 `release-test/myGym-v1.0.0-debug.apk` 通过 USB 或私有传输复制到手机。
3. 用文件管理器打开 APK，按系统提示仅为该文件管理器允许安装未知应用；完成后可关闭该授权。
4. 此包使用独立 `.test` 包名，不会覆盖原版 openGym；桌面名称仍为 myGym，可能与其他安装同名。
5. 在新应用中选择本地使用，先做一条测试训练，退出并重启，检查记录、累计时长与统计。
6. 再检查动作筛选/排序/隐藏、动画、提醒、含媒体备份导出及导入。不要用“重置全部”验证备份。
7. AI 保持默认关闭；如主动测试，可在手机中配置自己的服务。不要把密钥写进项目或反馈截图。

当前配置最低 Android 6.0（API 23）、目标 API 35；部分能力需要更高系统或系统组件。实际 ABI 和最终 manifest 以第四节 APK 核验为准。

## 七、剩余阻塞项与 Release 前要求

- 本包仅供个人安装测试，不公开分发，不代表素材授权已完成。保留原有 180px 素材及 NOTICE，不使用私有高分辨率素材。公开或商业分发前仍须核实 Gym visual 对 myGym 的授权范围；免费不等于已获授权。
- 保留 AGPL、NOTICE 和第三方声明；公开发布前提供与 APK 完全对应的修改版源码及构建说明。
- 未创建正式 Release 密钥。正式阶段再确认分发渠道、签名归属、密钥保管和后续升级策略；Debug 签名不可充当正式签名。
- Debug `.test` 与未来正式基础包名数据隔离。正式切换前应先导出测试数据，再导入正式版本，不能承诺自动迁移。
- 云备份排除用户媒体，自动 JSON 备份不替代完整 ZIP；新包名不会继承旧应用私有文件。
- 明文自托管 HTTP、用户 CA、通知/精确闹钟/前台服务及 Health Connect 权限仍需真机和发布渠道复核。
- 正式源码归档、Git remote 对齐、Release 签名、商店要求、正式更新策略以及完整设备验收留待后续阶段。
- Android lint 本阶段未得到最终结论，仍是正式 Release 前需要补齐的检查；历史前端全量测试失败也没有被本阶段相关回归全部覆盖。

本阶段完成后停止，等待用户手机测试反馈。不自动提交、合并、推送或公开上传 APK。

收尾已清理本任务的空闲构建/Kotlin 后台进程和辅助 lint 进程，并核验后移除临时 Y 盘映射。开发服务器、源码备份、SDK、测试密钥、测试日志及 APK 保留。训练记录和浏览器用户数据没有删除或重置。
