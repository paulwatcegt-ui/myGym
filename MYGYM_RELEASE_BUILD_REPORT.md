# myGym 本地正式包构建记录

日期：2026-10-22（Asia/Shanghai）。按用户确认方案，固定签名、本地自己保存、手动 APK 覆盖更新。

## 已交付文件

`release-local/myGym-v1.0.0-code27-release.apk`

| 项目 | 核验结果 |
|---|---|
| 名称 / 版本 | myGym / 1.0.0，versionCode 27 |
| 正式包名 | io.github.paulwatcegt_ui.mygym，不带 .test |
| APK 大小 | 222423926 字节，约 212.1 MiB |
| APK SHA-256 | cd859dcb3e5cc6fba8fffeb888c7b1f9dc9f27af251ff9437644b562ed2f35d9 |
| 证书 SHA-256 | 86bda86d110e64d616dd677af3b59a9d66e8212eb1c69e516154c9628fa42111 |
| 密钥 | 固定个人正式密钥，RSA 4096，非 Android Debug 证书 |
| 签名 | 官方 apksigner 校验成功，v1/v2 有效 |
| Debug 属性 | 未设置 application-debuggable |
| SDK / ABI | minSdk 23、targetSdk 35；arm64-v8a、armeabi-v7a |
| 安装其他 APK 的权限 | 无 REQUEST_INSTALL_PACKAGES |
| 移动资源 | mobile 标记存在；6554 张 still、6554 个 clip，保留素材 NOTICE |

同目录有 `.sha256`、`.signature.txt`、`.badging.txt`，保留完整核验输出。

## 构建和检查

- 使用 build-release.ps1 的正式流程构建，Gradle `:app:assembleRelease :app:lintRelease --offline --no-daemon --max-workers=1` 成功，340 个任务，首次执行耗时约 13 分钟。
- Release lint：0 错误、25 警告。现有依赖版本、资源及自托管网络配置等警告保留，没有增加忽略 baseline。
- 本次应用身份、更新关闭与移动打包相关回归：3 文件、13 项通过。
- 本阶段之前完整前端回归 413 文件、5103 项及原生单测 8 项通过；本次仅改签名/版本配置和构建脚本，没有重新运行全量业务测试。
- 移动生产构建、媒体打包、Android 同步和移动包检查通过。保留现有大包/动态导入提示、部分原生库无法剥离符号提示，以及 apksigner 对 META-INF 条目的警告；签名校验仍成功。
- build-release.ps1 结束后清理签名进程环境、移除临时 Y 映射。后续补充恢复终端工具链环境、版本一致性和已保存版本递增检查；脚本语法检查通过。
- 已验证重复版本保护：在现有 code27 交付文件存在时立即拒绝再次构建，且在读取签名密码或执行构建前停止。
- 密钥和密码保存在仓库外受限目录，未写入源码、日志或 APK 交付目录。源码只保存公开证书指纹。

日志在仓库上一级 `.local-tools/logs/mygym-release-build.log`、`mygym-release-regression.log`，Release lint HTML/XML 归档为 `mygym-release-lint-results.html`、`.xml`。

## 安装与保管

见 MYGYM_RELEASE_GUIDE.md。当前已安装的 Debug .test 包与正式版分开：首次切换先导出备份，在正式版中导入；不直接覆盖测试版。以后正式版本沿用同一包名、固定证书并提高 versionCode，直接安装更新，保留应用数据。

请将 `.local-tools/mygym-release-signing` 整个目录另存到安全的离线介质，包含私钥及含明文密码的 signing.json。本次只建立本地存储，没有选择外部设备备份，不宣称异地备份已经完成。

新正式包尚未做手机安装、迁移或覆盖升级实测。之前用户“使用无问题”的反馈针对原 Debug 包，不能替代本正式包验收。没有上传 APK、设置公开下载地址、提交或推送 Git。
