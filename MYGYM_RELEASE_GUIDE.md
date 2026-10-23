# myGym 本地正式版与手动更新

当前采用固定签名密钥和手动覆盖安装。自 2026-10-23 的 v1.1.0 发布起，正式 APK、更新说明和对应源码标签保存在 GitHub Releases，官网展示版本信息并链接指定版本附件；不提供应用内自动下载安装。

## 固定身份

- 正式包名：`io.github.paulwatcegt_ui.mygym`。
- 首个正式版本：`1.0.0`，`versionCode 27`。
- 当前正式版本：`1.1.0`，`versionCode 28`；[版本与下载](https://mygym-ckr.pages.dev/releases.html)、[完整更新说明](https://github.com/paulwatcegt-ui/myGym/releases/tag/v1.1.0)。
- 签名：RSA 4096，SHA256withRSA，证书有效期 10000 天。
- 证书 SHA-256：`86bda86d110e64d616dd677af3b59a9d66e8212eb1c69e516154c9628fa42111`。
- 源码中的 `release-signing-certificate.sha256` 固定此公开指纹；构建前和 APK 生成后均核对。

## 密钥保管

密钥目录位于仓库外：`D:\CodexWork\基于openGym的二次开发\.local-tools\mygym-release-signing`。

| 文件 | 用途 |
|---|---|
| myGym-release.p12 | 固定正式私钥，不得替换或重新生成 |
| signing.json | 密钥密码及别名；密码为随机生成，文件含明文秘密，不能分享或提交 |
| myGym-release.cer | 公开证书，不含私钥 |
| README.txt | 恢复及保管说明 |

目录权限限制到当前 Windows 用户和 SYSTEM。请将整个目录另存到安全的离线介质；同一硬盘内复制不能防止硬盘损坏。本次没有擅自选择外部备份设备，也不宣称已完成异地备份。

更换电脑时，把该目录恢复至新工作区的 `.local-tools/mygym-release-signing`，安装构建工具链，并保留源码中的指纹文件。密码不写进命令、源码或日志，构建时从本地文件读入进程环境，结束后清理。

Android 手动覆盖更新需要沿用相同应用身份与签名。依据：[官方签名说明](https://developer.android.com/studio/publish/app-signing)。丢失密钥或密码后，重新生成另一把密钥不能覆盖更新现有正式安装。

## 构建

在项目根目录运行：

```powershell
.\build-release.ps1 -Offline
```

现有缓存足够时使用离线模式；缺少依赖时先根据网络环境为当前 Java 进程配置代理，再去掉 `-Offline` 重试。不要升级依赖或关闭证书校验来处理下载失败。

脚本依次校验证书、构建移动资源、仅同步 Android、执行 `assembleRelease` 和 `lintRelease`、用官方 apksigner 校验签名并核对证书、用 aapt 核对包名/版本/非 debug 属性，最后复制到 `release-local/`。Y 盘必须空闲，脚本临时映射英文路径，结束后移除；正式私钥不会写入源码。

开始前会核对 Android 与网页版本名一致，并要求 versionCode 高于 release-local 中已保存的版本；结束时恢复工具链环境变量。

产物格式：`release-local/myGym-v1.1.0-code28-release.apk`，同时生成 `.sha256`、`.signature.txt` 和 `.badging.txt`。相同版本文件已存在时拒绝覆盖，保留以前的安装包。发布目录被 Git 忽略。

## 首次从测试包迁移

当前测试包使用 `.test` 后缀和 Debug 签名，与正式包数据隔离。正式版首次安装会作为另一个应用存在，不会覆盖测试包，也不会自动读取其数据。

两者桌面名称都可能显示为 myGym；首次安装完成后可直接从安装器打开正式版，必要时在系统应用信息中核对包名。

1. 从当前测试版导出备份；包含照片或视频时使用含媒体 ZIP。
2. 安装正式 APK，导入备份，核对训练、计划、照片及设置。
3. 确认数据齐全前保留测试版，不卸载、不清空；正式版权限可能需要重新授权。

## 后续覆盖更新

1. 保持正式包名、固定密钥和证书指纹不变。
2. 修改功能后，提高 `frontend/android/app/build.gradle` 的 `versionCode`（下一版至少 29）；同步 versionName 和 frontend/package.json 版本显示。
3. 构建并保存新的 APK 与校验文件。
4. 手机先导出备份，再打开新版 APK，选择安装更新；不先卸载正式版。
5. 安装后核对版本、训练记录和照片；应用内自动更新继续保持关闭。

官网下载入口：https://mygym-ckr.pages.dev/releases.html 。每个版本的按钮链接到对应的 GitHub Release APK；请核对版本号，避免把历史版本网盘链接当作最新版。

v1.1.0 已完成 Android 编译、完整 lint（0 个 Error/Fatal）、签名和包名版本检查。构建时使用临时 Gradle 初始化配置把生成缓存移出源码扫描目录，没有减少 lint 规则。未连接真机，1.0.0 → 1.1.0 的实际覆盖安装及个人数据保留仍需验收。再次构建并交付时需要递增 versionCode，脚本不会覆盖已保存的正式 APK。
