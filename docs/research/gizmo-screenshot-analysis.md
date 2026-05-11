# Gizmo 截图再分析与闪学改版要求

更新日期：2026-05-11

素材来源：`docs/research/home.jpg`、`decks-my .jpg`、`decks-public.jpg`、`progress.jpg`、`profile.jpg`、`gizmo video.mp4`。

说明：当前环境无法直接解码 MP4，且未安装 ffmpeg / ffprobe / moviepy / cv2；本轮改版以 5 张截图为直接证据，视频保留为后续人工核对素材。

## 1. Gizmo 的移动端信息架构

Gizmo 明确是竖版手机 App，不是 Web dashboard。底部导航为：

- Home
- Progress
- Add
- Decks
- Profile

其中 Add 位于底部中间，用绿色大按钮突出，是核心转化入口。闪学也应采用同样优先级：上传资料不是二级功能，而是 App 的中心动作。

## 2. Home 页设计要点

Gizmo Home 的首屏不是数据看板，而是“学习输入框”：

- 顶部显示当前学科 chip。
- 中间有 3D/角色 IP。
- 大标题是“What shall we study?”。
- 大输入框写“I want to study...”，里面有加号。
- 输入框下方直接给 Deck / Upload / Photo / YouTube / Paste / More。
- 下方才是 Jump back in、热门卡组、我的卡组。

闪学改版对应：

- 首屏大标题改成“今天学什么？”。
- 上传资料入口前置到首屏。
- 上传按钮矩阵包含“卡组 / 上传 / 拍照 / 粘贴 / 视频 / 更多”。
- “继续学习”只作为次级回流，不抢上传入口。

## 3. Decks 页设计要点

Gizmo 的 Decks 页非常列表化：

- 顶部标题居中，右侧搜索。
- My decks / Public decks 使用大 tab 和下划线。
- 公共卡组有 Level / Subject / School 筛选。
- 每张卡片左侧有高饱和彩色竖条。
- 卡片主体只放标题、卡数、标签、创建者，信息密度高。
- 右下角悬浮加号用于创建。

闪学改版对应：

- Decks 保留 My / Public 双 tab。
- 公共卡组改为中国考试与学科：考研、四六级、教资、公考、法考、高中生物等。
- 卡片采用左侧彩色竖条和卡数标签。
- 右下角保留悬浮加号，回到上传/创建。

## 4. Progress 页设计要点

Gizmo 的游戏化集中在 Progress 页：

- 顶部头像、Novice、Level、XP 进度。
- “Start your streak!” 卡片。
- 日历点亮。
- 深色大按钮“Start streak”。
- Jump back in 和 Deck progress 都用进度环。
- 好友排行榜用绿色 XP pill。
- Study groups 和 Following 动态流让游戏化具有社交压力和回访理由。

闪学改版对应：

- Progress 页成为游戏化主页面。
- 增加 Level、XP、streak、日历、Start streak 按钮。
- 增加好友排行榜和学习小组。
- 增加 Following 动态卡片，展示等级和 streak。

## 5. Profile 页设计要点

Gizmo Profile 是移动设置页：

- 顶部返回 + 居中标题。
- 头像居中，带编辑按钮。
- 设置项使用大卡片分组。
- 每行左图标、中间字段、右箭头。
- 底部保留隐私开关。

闪学改版对应：

- Profile 不再做 Web 设置面板。
- 使用头像、教育信息、考试目标、隐私开关、AI 标识、数据导出/清空。

## 6. 视觉语言

Gizmo 的视觉不是普通 SaaS 风格：

- 白底、浅灰页面、强阴影卡片。
- 极粗标题和按钮文字。
- 大圆角 pill。
- 底部图标具备玩具感和轻 3D 感。
- 高饱和彩色竖条用于卡组识别。
- 游戏化色彩集中在火焰、XP、绿色加号、等级徽章。

闪学改版对应：

- 强制手机竖版宽度，桌面只作为手机壳预览。
- 首页首屏使用 IP 形象。
- 底部 Add 使用绿色大加号。
- 卡片和按钮使用大圆角、粗字体、轻阴影。
- Progress 页重点突出火焰、XP、排行榜、好友动态。

