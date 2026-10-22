# myGym 相比原版 openGym 的详细改动说明

审查日期：2026-10-22。本文依据本地 Git 对象、实际文件差异、当前实现、测试源码与留存日志编写；本次没有运行构建或测试套件，没有安装依赖，没有修改应用源码，也没有提交或推送。

## 1. 项目简介

myGym 是基于 [DuarteSantos8/openGym](https://github.com/DuarteSantos8/openGym) 的个人二次开发版本。主要变化集中在动作库个性化、中文动作资料、统计展示、照片操作、设置简化和本地 Android 正式构建。训练、计划、媒体存储、自托管和同步的大部分基础能力继承原项目。

### 1.1 可追溯的对比基准

| 项目 | 本次核对结果 |
|---|---|
| 原版基线 | `e348fc17c42c7e9a211c5972e573ad3698190ee2`，原作者提交时间为 2026-10-13 |
| 原版版本依据 | 该提交的 `frontend/package.json` 为 `1.4.1`，Android 为 versionName `1.4.1` / versionCode `26` |
| 当前审查提交 | `f9b744240783c222ecbbe2b6e7fbe49fbad48d65`，本地 `main` |
| myGym v1.0.0 标签 | 指向 `0e86665546943428c3ec55490dd7746628bed4e7`；当前提交比它只多一次 README 修改，应用源码相同 |
| 当前显示版本 | 前端与 Android versionName 为 `1.0.0`，Android versionCode 为 `27` |
| 共同历史 | `git merge-base main upstream/main` 返回上述原版基线；本地已非浅克隆 |
| 后续提交 | 基线之后有 6 次本地提交，见第 7 节 |
| 本地远程配置 | `upstream` 为原版仓库；`origin` 为 `paulwatcegt-ui/newopenGym`；`mygym` 为 `paulwatcegt-ui/myGym` |

本次以**本地保存的原版提交**作比较，没有联网刷新远程引用；不将它称为原版目前最新版本。myGym 的 `1.0.0` 是修改版自己的版本命名，不能直接用数字判断它与原版 `1.4.1` 的功能先后。

### 1.2 范围及证据等级

基线到当前提交实际涉及 **117 个文件：31 个新增、86 个修改，没有整个文件被删除或重命名**。这包含文档、测试和生成翻译文件，不等于 117 项功能。本轮新增的两份说明未计入上述数字。

- **实现已确认**：原版与当前代码的差异可以直接复核。
- **有历史验证记录**：另有测试或构建结果日志，但不是本次重新执行的结果。
- **待验证 / 代码推断**：实现边界可以识别，真实设备、性能或复杂场景结论仍缺证据。

## 2. 改动总览

| 领域 | 类型 | 核心变化 | 用户可感知影响 |
|---|---|---|---|
| 动作管理 | 新增 | 内置动作个人覆盖、隐藏、恢复；新增管理页 | 可整理自己的动作库，保留原动作 ID |
| 自建动作入口 | 修改 | 从动作库列表首行移至管理页；选择器仍保留创建入口 | 入口位置改变，原有自建能力并非新发明 |
| 筛选范围 | 新增 | 三组范围可保存，搜索和选择器按范围处理 | 减少不需要的候选动作；清空一组会得到空列表 |
| 标签顺序 | 新增 | 拖动、触摸及方向键排序，保存组内顺序 | 按个人习惯排列身体部位、类型及器械标签 |
| 默认浏览排序 | 优化 | 固定动作 ID 清单优先，保留收藏与搜索规则 | 基础动作更容易出现在浏览前部，不代表统计热度 |
| 中文动作资料 | 扩充 | 补齐中文简介、缺失的中文要领 | 减少英文回退；术语质量仍需校对 |
| 首页与统计摘要 | 修改 | 连续周数展示改为累计训练时长 | 改看已记录时长，原来的连续周数展示被取代 |
| 统计布局 | 修改 | 将已有动作进度卡片提前 | 更靠前查看进度，图表计算逻辑没有随之重写 |
| 进度照片页 | 新增入口、修改 | 查看时可确认删除或替换照片 | 不必离开该查看界面处理照片 |
| 器械管理 | 删除、简化 | 移除设置页、搜索项及三个管理弹层 | 少一组设置，但不能在这些界面继续管理旧库存 |
| 品牌与说明 | 配置、修改 | myGym 名称、版本、关于页、仓库首页及分享文字 | 修改版身份更明确，不改变训练算法 |
| Android 更新 | 删除、配置 | 关闭原版更新网络请求、安装入口和对应权限 | 改为手动取得正式 APK 后安装更新 |
| Android 身份与签名 | 配置、新增工具 | 独立包名、固定签名构建、证书核对 | 正式版与测试版数据分开，后续更新沿用正式身份 |
| 原生兼容性 | 修复 | 旧系统排序调用、时间 API 保护、分版本主题、可选相机 | 解决已报告的 lint 错误，不能据此宣称所有手机已适配 |
| 同步及保存 | 扩展 | 三个新设置映射接入既有保存和合并机制 | 新增偏好可以随状态保存、同步；不是另建数据服务 |

## 3. 详细改动清单

### 3.1 动作库管理与内置动作的个人编辑

**类型：新增管理能力，调整既有入口。**

原版动作库提供浏览、搜索、收藏及自建动作入口；当前在搜索栏旁增加管理按钮和 `/library/manage` 路由。管理页可查看全部、自建、隐藏动作；自建动作继续复用原来的创建、编辑和删除流程。

内置动作新增对名称、身体部位、器械、简介和要领的个人编辑，以及隐藏、恢复显示、恢复原始内容。内容写入 `S.exerciseOverrides`，而不是改写原始 catalogue 定义。隐藏影响候选列表，动作索引及训练引用仍保留。重置内容仍保留隐藏状态和递增时间标记，以便既有同步合并区分新旧操作。

**实际影响与边界：** 用户可以整理动作库而不主动删除计划和日志里的动作。当前表单不是所有属性的完整编辑器，例如目标/辅助肌群映射不在这组字段内；不能把修改身体部位理解成重建全部肌群模型。

**依据：** `frontend/src/views/LibraryManage.jsx:16,47`、`frontend/src/views/Library.jsx:90`、`frontend/src/App.jsx:218`、`frontend/src/lib/exercise-overrides.js:2,11`、`frontend/src/lib/exercises.js:87,128`。`exercise-overrides.test.js` 检查隐藏后引用保留、索引别名、内容覆盖和恢复合并；`LibraryManage.test.jsx` 检查管理操作。实现已确认，有历史回归及隔离浏览器记录。

### 3.2 保存动作库范围，并在添加、替换动作时沿用

**类型：新增持久化筛选规则，修改候选列表逻辑。**

原版已有搜索、身体部位、类型、器械筛选以及器械配置过滤；myGym 并非从零新增筛选器。新增的是管理页中可保存的“动作库范围”：同组允许项取并集，身体部位、类型、器械三组之间取交集。任何一组的可用选项全被取消时，候选列表为空；“全部”只在已允许范围内生效。

范围在搜索前作用于候选集，相似建议也按当前范围和筛选条件限制。正常添加、替换动作的选择器及其“按肌群”模式接入同一组偏好，减少列表切换后的差异。既有快捷添加、详情配置、收藏和已选动作入口保留。

**边界：** 独立的 `/muscles` 页面仍通过默认 `libraryPreferences = false` 使用肌肉探索组件，不能声称所有页面都执行同一套范围限制。旧器械配置过滤仍可能叠加；“显示所有器械”不等于清除新的个人范围。

**依据：** `lib/library-filters.js:25`、`views/Library.jsx:35`、`sheets.jsx:1209,1267,1285`、`components/MuscleExplorer.jsx:22,36` 和未修改的 `views/Muscles.jsx`（上述路径均在 `frontend/src/`）。`library-filters.test.js` 与 `sheets.picker-library.test.jsx` 覆盖交并规则、全空、搜索、肌群选择和计划不变等场景。实现已确认，未把原版已有的快捷添加说成新增。

### 3.3 标签排序和基础动作浏览顺序

**类型：新增偏好、交互优化。**

原版使用原有标签顺序；myGym 增加每组标签的拖动手柄，支持鼠标、触摸和方向键。取消手势不提交排序；完成后保存顺序，恢复默认时也保留可同步的时间标记。过时、重复选项会被处理，新选项追加到末尾。仅手柄接管拖动，复选框区域保留勾选和滚动操作。

浏览动作时加入人工指定的基础动作 ID 清单。自建动作、收藏及搜索相关性仍参与原有排序规则；不能将清单称为用户热度统计、推荐模型或性能优化。

**依据：** `components/LibraryFilterGroup.jsx:10`、`lib/library-filters.js:8,14,19`、`lib/library-order.js:5,50`、`index.css:2139`。对应测试覆盖跨行拖动、触摸取消、键盘移动、顺序合并、搜索匹配及数据不变。历史浏览器 JSON 另记录了实际触摸和刷新保存；本次没有重新进行交互验收。

### 3.4 补齐简体中文动作简介和要领

**类型：内容扩充和本地化完善，不是新增动作总量。**

本次直接读取基线和当前 `catalogue/i18n/zh.json`，得到：

| 项目 | 原版基线 | 当前 |
|---|---:|---:|
| 动作条目 | 5632 | 5632 |
| 非空中文简介 | 0 | 5632 |
| 有中文要领的动作 | 1324 | 5632 |

原有中文名称没有变化，原有 1324 组要领没有被改写。新增中文简介包为 `frontend/src/exercise-desc/zh.js`，中文要领生成包同步更新。现有 `scripts/catalogue/` 生成工具及原始动作定义未变。

本次另做只读数据核对：5632 个内置动作的当前生成包没有发现简介缺失、空步骤或与英文步骤数不一致。语言切换沿用原机制，个人覆盖内容优先；“英文动作名称”设置不把中文简介和要领整体切回英文。新增界面文案在中文和繁体中文有对应文本，其他若干语言新增键仍使用英文回退，不能称为所有语言均已人工翻译。

**质量限制：** 机器翻译的历史来源见前期记录；没有本次人工逐条审校证据。当前动作 `1000` 简介出现“它训练小牛”，可直接观察到术语直译问题。因此只能确认覆盖完整，不能确认所有训练术语及要领准确。

**依据：** catalogue 原始 JSON 与生成包、`lib/i18n-core.js:162,175,207`、`lib/zh-exercise-details.test.js`。未新增运行时翻译服务或翻译 SDK；基础语言加载模块 `lib/i18n.js` 未改。

### 3.5 累计训练时长取代两处连续周数展示

**类型：展示指标调整，新增聚合格式函数。**

原版首页使用 `streakWeeks(S)` 展示连续周数，统计摘要也显示连续周数；myGym 将这两处替换为“累计训练时长”，共用 `lib/training-time.js`。周内完成数、总训练次数等其他摘要仍保留。

计算复用原版 `history.js:779` 的 `workoutDuration`：累计已保存训练中有效结束与开始时间的非负差值，不包含当前活动训练，不补估缺少时间的记录。先累计再格式化；不足一小时走原有分钟格式，达到一小时显示一位小数的小时数；达到 1000 小时换为日，达到 24000 小时换为年，按 24 小时/日、365 日/年换算，不使用千位分隔。小时、日、年是经过时间单位，不是出勤天数或日历年数。

例：14 小时为 `14.0 h`，1000 小时为 `41.7 d`。已有训练却没有可用时长时显示 `–`；没有训练时保留原格式函数的零时长显示。

**实际影响：** 更紧凑地展示累计时长，原版连续周数的这两个展示入口不再保留。没有修改时长原始字段或训练时长计算基础函数，也没有新增训练负荷或 1RM 算法。

**依据：** `views/Home.jsx:233`、`views/Stats.jsx:643`、`lib/training-time.js:6`，对应 `training-time.test.js` 与 `Home.training-time.test.jsx`。代码与测试可支持单位阈值、忽略活动训练、先累计后换算等行为；历史窄屏检查不是所有字体、设备和极端值永不换行的保证。

### 3.6 统计页卡片顺序调整

**类型：界面布局修改。**

当前“动作进度”卡片位于肌群平衡之后、每周计划训练量之前；原版该进度卡片位于后面的统计内容区域。原有估算 1RM、次数、重量、用力程度、每组曲线和日期范围逻辑未作为此次布局改动重写。

**依据：** `views/Stats.jsx:660,709` 的移动代码块，`views/Stats.plan-volume.test.jsx:82` 核对卡片邻接关系。训练量图、肌群平衡和进度图本身均是原版能力，不能写为 myGym 新增。

### 3.7 在进度照片查看器中删除、替换照片

**类型：新增当前页面操作，复用既有媒体机制。**

原版进度照片查看器提供查看；底层已有添加/删除训练媒体引用能力。当前查看器加入删除确认、取消和替换图片入口，并新增原地替换引用的辅助函数。

替换保留原训练、日期、其他媒体顺序和训练字段；同一图片、重复图片、无效媒体、原引用已移除或训练已删除时，不先删除原引用，也不据旧副本重建训练。删除移除该训练的引用，不直接物理删除共享文件；后续文件回收继续使用原机制。替换入口针对图片，不能表述为新增任意视频替换能力。

**依据：** `views/ProgressPhotos.jsx:76`、`lib/workout-media.js:57,68`；`ProgressPhotos.edit.test.jsx` 和 `workout-media.test.js` 覆盖取消、导入失败、满额替换、重复引用及过期记录。历史独立浏览器记录确认过实际替换、删除与刷新，未据此覆盖所有原生相册组合。

### 3.8 品牌、关于页和仓库展示

**类型：品牌配置、文字与文档修改。**

网页标题、PWA 名称、游客首页、登录/引导页、Android 名称资源、部分通知、分享图片和打印计划文字改为 myGym。关于页新增修改版介绍、原作者及修改版源码链接。README 改为 myGym 中文展示，移除原版横幅、截图和上游徽章引用；原素材文件没有因此删除。

原版 Debug 名称为 OpenGymTest，当前也显示为 myGym；正式版与测试版并存时可能出现同名图标，应通过应用信息或安装来源区分。`public/sw.js` 的差异仅为通知默认产品名，未因此改写缓存策略。

翻译层通过限定文案键集合改名，在填入用户参数之前替换产品名称。它不是对所有 openGym 字符串的全局替换；用户内容、`Documents/openGym` 等旧数据路径、技术标识和法律声明继续保留。关于页部分介绍直接为中文，并非所有语言均有专门译文。

网页关于页同时保留区分品牌的原版 Android 入口和 myGym 项目链接；myGym 按钮目前是仓库入口，不能将其描述为已经存在的 APK 直接下载链接。原生端不显示这两个网页下载入口。

**依据：** `lib/product-copy.js`、`lib/i18n-core.js:79`、`views/Settings.jsx:741,764`、`api/push-messages.js`、`frontend/index.html`、`public/manifest.json`、Android strings、README；分享和备份相关差异主要为显示名称，不是新导出格式。测试见 `product-copy.test.js`、`Settings.reset.test.jsx` 及通知/分享测试。

## 4. 删除与简化的功能

| 被删除或简化的部分 | 原有用途 | 当前范围及取舍 |
|---|---|---|
| 设置中的器械管理页及搜索项 | 管理器械配置、活动场景、库存及过滤开关 | 页面、入口、相关预览和管理组件被移除；不是清空旧器械数据 |
| EquipmentProfileSheet | 创建、编辑器械场景 | 弹层及导出函数删除；既有场景仍可能参与过滤 |
| PlateInventorySheet / DumbbellInventorySheet | 修改拥有的杠铃片数量和哑铃重量列表 | 弹层及导出函数删除；底层重量步进、库存约束模块保留，旧值仍可能影响训练 |
| 首页和统计的连续周数摘要 | 展示连续训练周数 | 被累计时长替换；底层 streakWeeks 函数并未删除 |
| 动作库首行的自建入口 | 快速创建自建动作 | 迁到管理页；选择器的自建入口保留，未删除自建能力 |
| 原版 Android 应用内更新流程 | 请求上游 Release，下载、校验并打开安装器 | 入口、请求和安装实现关闭；改为人工保管及安装新版 |
| APK 安装权限及原生插件注册 | 支持应用内拉起 APK 安装 | 移除 REQUEST_INSTALL_PACKAGES 和 InstallPlugin 注册；插件源文件仍在 |
| 原版 README 宣传展示 | 展示上游横幅、下载、徽章和截图 | 改为修改版说明；版权和许可文件保留 |

器械 UI 简化的直接目的可从提交和删除代码判断为减少设置项；不能将其描述为完整器械功能升级。对依赖自定义器械库存的用户，这是一项能力取舍。旧配置若造成过滤或重量约束，当前缺少原设置界面的修改入口，是需要关注的兼容边界。

旧的器械设置链接会按现有路由校验退回设置页；`settings-pages.test.jsx` 对此有断言，同时核对旧器械配置和训练数据没有被页面操作清除。

没有发现删除底部导航、整个训练/计划/统计模块或 AI 教练模块的差异。`TabBar.jsx`、`Workout.jsx`、`Plan.jsx` 与基线相同；原版默认 `workoutView: 'cards'` 也已存在。

## 5. 技术与底层变化

### 5.1 保存、状态结构与兼容性

| 方面 | 实际变化 | 兼容边界 |
|---|---|---|
| 新增字段 | exerciseOverrides、libraryFilterVisibility、libraryFilterOrder，默认空映射 | 老状态缺字段时通过默认值/可选访问兼容；不是全新存储格式 |
| 保存位置 | 继续使用 Zustand、gym_state_v1、本地与原生保存机制 | 未改存储键、账户存储协议及原生持久化模块 |
| 同步 | 前后端 STAMPED_MAPS/OWN_MERGE 接入新字段，沿用逐项时间标记合并 | 覆盖按动作/选项/组的冲突处理，不保证任意旧客户端均理解新字段 |
| 登录保留资料 | hasData 与 localExtras 纳入个人动作覆盖 | 仅有筛选或排序偏好是否被登录替换保留，见限制章节 |
| 备份 | 原有完整状态序列化继续包含新字段；媒体 ZIP 结构未变 | JSON 不等于含照片文件的完整备份；旧版本导入的全部行为未专项验收 |
| 训练引用 | 原始动作 ID、计划和日志结构保留 | 覆盖显示内容可影响看到的名称/分类，不能保证所有页面文字与基线完全一样 |

关键位置：`store/useStore.js:31,106,279,296,586`、`lib/sync-merge.js:86,613,1128`、`api/sync-stamps.js:64,72`、`lib/backup-media.js:68`。服务端 `api/server.js`、OpenAPI 路由定义及前端 API 通信模块未改；没有新增数据库或更换后端框架。

### 5.2 不变的训练核心与依赖

本次对比确认 `progression.js`、`onerm.js`、`recovery.js`、`history.js`、`finish-workout.js`、`plates.js`、`dumbbells.js`、`equipment.js` 没有文件差异。未发现重新设计负荷递增、1RM、疲劳恢复、训练完成规则或器械库存算法的证据。

前端 dependencies/devDependencies 声明与基线一致，锁文件除项目版本字段外内容一致；没有新增 npm 包或升级依赖。基础 React/Router/Zustand 架构保留。底部导航、原图标、主要配色没有对应的重设计改动；新增 CSS 主要服务筛选排序组件。

### 5.3 Android 身份、更新与签名

正式 applicationId 从 `ch.duartesantos.opengym` 改为 `io.github.paulwatcegt_ui.mygym`，Debug 继续加 `.test`。Java namespace、源码包路径及自定义 URL scheme 保留，不能将这次改名描述为所有内部标识都已迁移。

正式版、原版和测试版的应用私有数据空间不同。首次切换需要自行导出、导入备份，不能直接覆盖原版或 Debug 包来自动迁移数据。后续正式版本使用同一包名和固定签名，增加 versionCode 后手动安装更新。

原版更新模块从联网查询、下载、安装改为无网络的兼容导出：检查返回无更新，直接下载/安装调用明确拒绝。原有 SHA-256 辅助函数保留。只移除了这一更新通道，不能称为关闭全部网络通信或完成整体安全审计。

正式签名通过环境变量传入 Gradle；新增本地构建脚本、公开证书指纹及忽略规则。脚本核对版本一致性、已保存的版本号、签名前后证书、APK 包名、非 debug 属性，并保存校验文件。私钥与密码不属于源码，本说明不列出其内容或具体私密位置。

### 5.4 构建方式与内部配置

- `frontend/scripts/build-mobile.mjs` 用 Node 顺序调用现有 Vite、媒体准备、Capacitor 和包检查，替换仅适合 Unix 的环境变量串接语法，支持选择同步 Android 或 iOS。离线媒体打包本来就有，不能称为本版本原创能力。
- `build-release.ps1` 为本地 Windows 正式流程：暂用英文盘符、构建 Release、执行 Release lint、校验并本地保存 APK；不是所有操作系统通用的发布系统。
- 保留工程 AGP 8.7.2 / Gradle 8.11.1，强制插件构建脚本使用同一 AGP。当前安装的安全存储插件自身请求 8.13.0，此处是工具链统一，没有更改 npm 依赖版本。
- 中文 Windows 路径兼容采用 overridePathCheck 及临时盘符；环境脚本设置工作区工具和缓存，未修改应用业务配置。
- **可复现限制：** use-android-env.ps1 引用仓库外的 use-dev-env.ps1，并依赖工作区预备的 JDK、SDK、Node 和缓存；只克隆此仓库不能直接复现本机脚本，需要补齐这些准备工作。
- Android minSdk 23、compileSdk/targetSdk 35 及 Release 仅保留 ARM 两种 ABI 的设置原版已有；不是此次新增设备覆盖。iOS 原生目录没有差异，本次不能声称已构建或验收 iOS 修改版。

## 6. 缺陷修复和已知限制

### 6.1 有实现和验证依据的修复

| 问题 | 修复方式 | 证据与结论边界 |
|---|---|---|
| API 23 上调用需要 API 24 的 List.sort | 备份清理改用 Collections.sort，比较器不变 | BackupFolderPlugin.java:139；历史 lint 复查通过，未做 Android 6 真机专项复测 |
| Health Connect 时间辅助方法缺少明确版本保护 | 方法内加入 Android 9 以下保护 | HealthConnectPlugin.java:244,249,263；原版入口已有支持判断，此处不是新增 Health Connect 功能 |
| 基础样式使用新系统刘海屏属性 | 属性移到 values-v28/styles.xml | 历史 lint 通过；不等同于所有刘海屏实测通过 |
| 相机权限隐含强制硬件要求 | 声明 camera 和 autofocus 为可选 | AndroidManifest.xml:115；修复声明，不是新增扫码功能 |
| 精确闹钟权限的 ProtectedPermissions 报告 | 单条声明局部标记，并保留运行时判断和说明 | AndroidManifest.xml:97；这是对误报的处理，不是运行时提权或修复系统权限机制 |
| Windows 移动包测试路径不一致 | 测试诊断路径转为统一分隔符 | check-mobile-bundle.test.mjs；属于测试跨平台修正，不改变生产检查器 |
| 设置下载搜索项与实际显示不一致 | 参数化两种品牌标题，使用显示标签导航和区分键 | settings-pages.js:117,168；settings-pages.test.jsx 有命中及导航断言 |
| 新界面导致旧回归断言过时 | 按管理入口、品牌、包名和继承文案调整断言 | 相关测试差异可复核；不把单纯改测试说成修复运行时故障 |
| 缺失时长占位符与项目规则不一致 | 改用统一的 `–` | training-time.js 与 empty-placeholder.test.js，历史局部复查记录 |

### 6.2 已知限制、待核实与潜在兼容问题

1. **中文质量需校对：** 覆盖率可复核，翻译正确性未完成验收；已有直译示例，见 3.4。
2. **旧器械设置仍生效：** UI 被移除但状态和算法保留，可能继续限制候选动作和重量步进；原管理入口无法再调整它们。
3. **筛选/排序偏好的登录保留待专项验证：** `hasData` 和 `localExtras` 新增的是 exerciseOverrides，未专门计入另两个新映射；只改筛选或排序、没有训练/动作覆盖的游客状态，不应承诺其偏好在登录替换时必然保留。这是代码可见的覆盖边界，不是本次复现的数据丢失事件。
4. **筛选作用范围有区别：** 选择器的肌群模式启用范围偏好，独立肌肉探索页默认不启用；不能宣传“全应用统一过滤”。
5. **正式包设备验收不足：** 用户先前反馈正常的是 Debug 包；没有完整正式包安装、数据迁移和连续版本覆盖升级的验收证据。锁屏提醒、拒绝权限、省电策略、Health Connect、相册和服务器配对仍需分场景验证。
6. **原生与跨设备能力并非此次原创：** Passkey、同步、离线媒体、提醒和备份主要继承原版；新字段的合并单测不能替代任意旧客户端和离线设备组合的验证。
7. **警告仍保留：** 历史 Debug lint 为 0 错误/29 警告，Release lint 为 0 错误/25 警告。包括依赖版本、资源、HTTP/用户 CA 配置等；没有把保留警告或局部权限改动表述为“零风险”。原网络安全配置允许自托管 HTTP 和用户 CA，文件本身未改。
8. **API/MCP 历史失败未解决承诺：** 留存原版环境日志有 API 568 通过/28 失败，以及 MCP 的 Windows 测试和监听错误；本次不归因为新功能，也不宣称全栈、跨平台 CI 已全绿。
9. **构建与发布仍有范围限制：** Windows 流程依赖外部工具；没有新的公开下载服务器或自动更新系统，源码标签不等于已上传 APK。本次不联网核验 Releases 页面。
10. **没有性能基准：** 可描述入口减少、顺序可调、候选范围更明确；没有数据支持启动更快、内存下降、响应速度提升等结论。
11. **许可不扩张：** LICENSE、NOTICE 和 catalogue/media 声明未改；不能从改名或开源源码推导出获得了额外媒体分发授权。

## 7. 改动证据

### 7.1 提交对应关系

提交信息仅作定位，前文结论同时核对了实际差异和实现。

| 提交 | 本次核对到的主要范围 |
|---|---|
| [9f7924a8](https://github.com/paulwatcegt-ui/myGym/commit/9f7924a8) | 设置器械管理 UI 简化、动作管理、中文资料及保存/同步扩展 |
| [0a93f52a](https://github.com/paulwatcegt-ui/myGym/commit/0a93f52a) | 动作库范围、组内标签排序与基础动作浏览顺序 |
| [cf39d7da](https://github.com/paulwatcegt-ui/myGym/commit/cf39d7da) | 选择器及其肌群模式沿用动作库偏好 |
| [fe29fb5b](https://github.com/paulwatcegt-ui/myGym/commit/fe29fb5b) | 品牌和版本、时长展示、统计布局、照片操作与关于页 |
| [0e866655](https://github.com/paulwatcegt-ui/myGym/commit/0e866655) | Android 独立身份、更新关闭、固定签名流程、lint 兼容修复、紧凑时长与回归调整 |
| [f9b74424](https://github.com/paulwatcegt-ui/myGym/commit/f9b74424) | 仅 README：首页展示改为 myGym |

### 7.2 关键源码入口

以下位置以审查提交 `f9b74424` 为准；后续开发可能改变行号。短路径前缀未注明时为 `frontend/src/`。

| 主题 | 源码位置 | 对照或测试 |
|---|---|---|
| 内置动作个人覆盖 | lib/exercise-overrides.js:2,11；lib/exercises.js:87,128 | exercise-overrides.test.js |
| 管理路由与表单 | App.jsx:218；views/LibraryManage.jsx:16,47 | LibraryManage.test.jsx |
| 筛选语义和时间标记 | lib/library-filters.js:8,25,36 | library-filters.test.js |
| 手柄交互及排序 | components/LibraryFilterGroup.jsx:10；lib/library-order.js:50 | LibraryFilterGroup.test.jsx、library-order.test.js |
| 添加与肌群候选 | sheets.jsx:1209,1285；components/MuscleExplorer.jsx:22,36 | sheets.picker-library.test.jsx |
| 翻译与覆盖优先级 | catalogue/i18n/zh.json；lib/i18n-core.js:162,175,207 | zh-exercise-details.test.js |
| 时长与进度位置 | lib/training-time.js:6；views/Home.jsx:233；views/Stats.jsx:643,660 | training-time.test.js、Home.training-time.test.jsx、Stats.plan-volume.test.jsx |
| 照片替换 | views/ProgressPhotos.jsx:76；lib/workout-media.js:68 | ProgressPhotos.edit.test.jsx、workout-media.test.js |
| 状态和同步 | store/useStore.js:106,296；lib/sync-merge.js:86,1128；api/sync-stamps.js:64 | persistence.test.js、上述覆盖及筛选测试 |
| 品牌与搜索 | lib/product-copy.js；views/Settings.jsx:764,858；views/settings-pages.js:117,168 | product-copy.test.js、settings-pages.test.jsx |
| 更新隔离 | lib/update.js；AndroidManifest.xml；MainActivity.java | update.test.js、Settings.update.test.jsx |
| 正式构建 | build-release.ps1:6,42,46,62,71,75,90；frontend/android/app/build.gradle:7,20,33 | 历史 Release 构建日志、版本重复保护检查记录 |

例如可通过[当前个人覆盖实现](https://github.com/paulwatcegt-ui/myGym/blob/f9b74424/frontend/src/lib/exercise-overrides.js)、[原版动作库](https://github.com/DuarteSantos8/openGym/blob/e348fc17/frontend/src/views/Library.jsx)、[原版设置实现](https://github.com/DuarteSantos8/openGym/blob/e348fc17/frontend/src/views/Settings.jsx)复核前后行为。

### 7.3 验证记录与适用范围

本次读取了现有日志和测试源码，**没有重新运行这些套件**：

| 历史证据 | 留存结果 | 可以支持的结论 |
|---|---|---|
| precommit-frontend-final.log | 413 文件、5103 项通过 | 曾完成一次完整前端回归；不拼接为全栈通过率 |
| 原生 JUnit XML | RestToneTest 7 项、示例 1 项，失败/错误均为 0 | 这 8 项原生测试通过，不能代替所有新增原生路径的设备验收 |
| android-lint-fixed.log 与 Debug lint 文本 | 构建成功，0 错误/29 警告 | 记录中的兼容修复通过 Debug 静态检查 |
| mygym-release-build.log 与 Release lint XML | assembleRelease/lintRelease 成功，0 错误/25 警告 | 曾完成签名正式构建，不等于手机安装成功 |
| mygym-release-regression.log | 3 文件、13 项通过 | 应用身份、更新隔离及移动包相关检查 |
| library-management-browser.json | 编辑/隐藏/恢复、刷新、语言、手机入口为真，无记录到的页面错误 | 历史隔离会话中的这些操作完成 |
| library-tag-order-browser.json | 桌面/触摸排序、刷新、默认恢复、窄屏检查为真 | 指定测试环境的交互证据，无设备覆盖率结论 |
| library-scope-browser.json、picker-library-browser.json | 范围、相似建议、空组、刷新、快捷/配置添加为真 | 测试数据下候选规则一致，不代表所有页面均使用相同范围 |
| mygym-browser.json | 品牌、统计时长、照片替换/删除及记录保留为真 | 指定测试数据下的浏览器操作证据 |

日志与浏览器 JSON 保存在工作区的仓库外目录，**未随 Git 源码公开**；外部读者可查看仓库中的测试源码和构建记录，或自行复现。现有日志不构成带不可变源码快照的第三方认证，本次没有补做运行或性能测量。

本次额外执行的只读检查为：Git 基线/标签/文件状态核对；翻译 JSON 数量和原有字段一致性核对；当前生成中文资料的缺失及步骤数核对；前端依赖和锁文件版本外内容比较；关键未改模块的差异核对。没有执行远程查询、fetch、分支切换或标签操作。

可复核的只读 Git 命令：

```sh
git merge-base main upstream/main
git show e348fc17:frontend/package.json
git diff --name-status e348fc17 f9b74424
git diff e348fc17 f9b74424 -- frontend/src/views/Stats.jsx
git diff --name-only v1.0.0 f9b74424
git log --oneline e348fc17..f9b74424
```

## 8. 总结

myGym 的主要价值是对成熟原项目进行个人使用取向的整理：内置动作可个人编辑和隐藏，范围与标签顺序可保存并用于添加动作，中文资料更完整，时长与照片操作更符合当前使用习惯，并建立独立的 Android 身份和本地签名构建流程。

同时存在明确取舍：器械管理界面和原版应用内更新被移除，连续周数的两处展示被替换。训练核心、离线能力、同步基础和大部分视觉框架仍来自 openGym；不能将其包装为全新原创系统或经过全面性能、安全性升级的产品。

后续值得完善的是中文术语校对、旧器械配置可维护性、仅偏好状态的保留验证、正式包迁移与覆盖升级验收，以及脱离现有工作区的构建准备说明。许可和原作者来源继续以 [LICENSE](LICENSE)、[NOTICE.md](NOTICE.md) 与[原版项目](https://github.com/DuarteSantos8/openGym)为准。
