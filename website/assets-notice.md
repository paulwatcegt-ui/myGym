# myGym 官网素材与来源

- 官网在 openGym 的手写 HTML/CSS/JavaScript 基础上改造，通过 base.css 复用 styles.css 中实际使用的基础样式、颜色变量、按钮、容器与 index.html 中的 SVG 图标。原作者：Duarte Santos，Copyright (C) 2026。代码许可证见 legal/LICENSE.txt，完整第三方声明见 legal/NOTICE.txt。
- mygym.css 与 mygym.js 是 myGym 的产品布局和本地交互层，未引入框架、字体 CDN、第三方分析或远程演示。
- img/home.png、plan.png、history.png、stats.png、library.png 是 2026-10-22 在本地 myGym Web 应用 390×844 视口、2 倍像素密度下截取的真实界面。数据由应用既有 buildDemoState() 生成，不是用户训练记录。手机外框由 CSS 绘制，并非应用截图的一部分。
- 截图时阻断 exercise-media 请求并隐藏媒体元素；不复制、分发或热链 Gym visual 动作图片或动画。未将这些媒体用于生成视觉素材。原项目对动作媒体的独立限制继续保留在 NOTICE 中。
- favicon 复用项目原有 icon-96.png，不声明为新绘制的独立 myGym 图标。独立品牌图标可后续替换。
- 用户提供的绿色设计参考图仅用于布局、颜色与视觉方向，没有将其概念手机界面当作真实应用截图。

- 新增 WebP 为上述原始截图的无损转码版本或缩小的 360px 列表版本，不新增或生成应用界面内容。1200×630 分享图使用同一真实首页截图与代码绘制的品牌文字、背景和手机边框，未使用第三方图库或动作媒体；文件名与尺寸映射见 image-assets.json。原始 PNG 继续保留作来源，构建不再发布原始 PNG。
- 首屏手机主视觉已替换为用户于 2026-10-23 提供的 Android 首页截图（1200×2670），展示轮换训练、体重与累计训练时长。该主视觉不再标为演示数据；图集及分享图继续使用原演示截图。新主视觉仅缩放、转码，不裁剪或生成界面内容。
