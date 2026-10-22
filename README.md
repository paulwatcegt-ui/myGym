<div align="center">

<h1>myGym</h1>

**为个人训练打造的健身记录应用**

安排训练计划，记录每一组动作，用自己的数据观察进步。

**v1.0.0 · 中文动作说明 · Android 离线使用 · 自主保管数据**

[项目源码](https://github.com/paulwatcegt-ui/myGym) · [v1.0.0 源码](https://github.com/paulwatcegt-ui/myGym/tree/v1.0.0) · [修改记录](MYGYM_CHANGELOG.md) · [安装与更新说明](MYGYM_RELEASE_GUIDE.md)

</div>

## 关于 myGym

myGym 是基于 [openGym](https://github.com/DuarteSantos8/openGym) 二次开发的个人健身应用，由宋培恩（PeiEn Song）维护。在原有训练记录、计划和统计能力上，调整中文体验、动作库管理、进度照片及 Android 使用流程。

本仓库展示和维护 **myGym**。原项目作者、版权及第三方素材说明保留在文末和许可文件中。

## 主要功能

| 功能 | 当前体验 |
|---|---|
| 训练计划与记录 | 安排训练日、记录组数与重量，训练界面默认采用卡片视图 |
| 中文动作库 | 内置动作的中文名称、简介和操作要领，配合动作示范查看 |
| 动作管理 | 创建自己的动作，编辑或隐藏内置动作，恢复原始内容；保留计划和历史引用 |
| 筛选与排序 | 保存身体部位、器械及动作类型的筛选范围，调整标签顺序；添加动作时沿用动作库偏好 |
| 累计训练时长 | 首页与统计页共用已完成训练的实际时长；大数值自动压缩为小时、日或年 |
| 进度照片 | 查看、替换和删除训练照片，保留所属训练记录 |
| 离线与备份 | Android 包含离线动作媒体，支持数据备份；照片和视频可使用含媒体 ZIP |
| 可选自托管 | 沿用原项目的自托管与同步架构；需要自行配置服务 |

新增的中文简介和要领包含批量机器翻译，尚未逐条人工校对。用户自行填写的动作内容保持原文。

## Android v1.0.0

- 应用名称：**myGym**。
- 正式版：`1.0.0`，`versionCode 27`。
- 正式包名：`io.github.paulwatcegt_ui.mygym`。
- 支持 Android 6.0（API 23）及以上；正式 APK 包含 ARM 32 位与 64 位架构。部分系统功能有更高版本要求。
- 使用固定正式签名，后续通过手动安装新版 APK 覆盖更新；应用内自动更新保持关闭。

**当前仓库已提供源码与 v1.0.0 标签，尚未上传 APK 附件。** 本地正式安装包已构建并完成签名核验；源码标签不等于安装包下载页面。

### 首次从测试版切换

测试版包名带 `.test`，与正式版分别保存数据。先在测试版导出备份，再安装正式版并导入；包含照片和视频时使用含媒体 ZIP。确认数据齐全前，保留测试版和备份。

### 后续正式版更新

先备份数据，再打开新版正式 APK 安装更新，保留原应用。构建新版时须沿用正式包名与签名密钥，并提高 `versionCode`。

详细操作见 [安装、密钥保管与手动更新说明](MYGYM_RELEASE_GUIDE.md)。签名私钥、密码、用户数据和本地 APK 不提交到 Git。

## 开发与构建资料

| 资料 | 内容 |
|---|---|
| [myGym 图文改动说明](MYGYM_CHANGELOG_SHORT.md) | 面向用户的变化介绍与实际界面配图 |
| [myGym 修改说明](MYGYM_CHANGELOG.md) | 功能改动、实现位置和各阶段验证记录 |
| [正式版使用与构建说明](MYGYM_RELEASE_GUIDE.md) | 本地签名构建、数据迁移、密钥备份与手动更新 |
| [正式 APK 核验记录](MYGYM_RELEASE_BUILD_REPORT.md) | 包名、版本、签名、文件校验值和构建结果 |
| [Android lint 记录](MYGYM_ANDROID_LINT_REPORT.md) | 兼容性修复、保留的警告和测试证据 |
| [项目续接记录](MYGYM_RESUME_REPORT.md) | 开发进度及后续事项 |
| [原架构文档](docs/README.md) | 自托管、API、数据导入及移动端等原项目说明 |

原架构文档中的部分名称与发布渠道仍对应 openGym，myGym 的品牌、安装和更新方式以本仓库的 myGym 文档为准。历史报告中的分支、提交与待办是当时的快照，请结合当前代码和 Git 记录阅读。

本地正式包已经完成构建和签名核验，Release lint 为 0 错误、25 个保留警告；具体测试范围和未完成的正式包真机验收见核验记录。

## 致谢与许可

- 原项目：[DuarteSantos8/openGym](https://github.com/DuarteSantos8/openGym)，Duarte Santos © 2026。感谢原作者及贡献者。
- 项目代码许可见 [GNU AGPL v3](LICENSE)，第三方声明见 [NOTICE.md](NOTICE.md)。
- 动作图片和动画来自 Gym visual，**不包含在代码的 AGPL 许可内**；具体授权范围和原始声明见 [动作媒体说明](NOTICE.md#exercise-media-stills-and-animations) 及 [媒体声明文件](catalogue/media/NOTICE.md)。
- 原项目的版权、许可证和素材声明继续保留；myGym 的品牌展示不改变第三方素材授权。
