# Gizmo 截图再分析与闪学改版要求

更新日期：2026-05-11

素材来源：`docs/research/home.jpg`、`history.jpg`、`add.jpg`、`decks-my .jpg`、`decks-public.jpg`、`progress.jpg`、`profile.jpg`、`gizmo video.mp4`。

说明：当前环境未安装 ffmpeg / ffprobe / moviepy / cv2，但已通过本地 HTML 播放页截取 `gizmo video.mp4` 首帧进行核对。视频首帧与 Home 截图一致，重点仍是“学什么输入框 + Deck / Upload / Photo / YouTube / Paste / More + 底部 Add 导航”。

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

## 2.1 History 是用户历史资料搜索

用户补充说明后修正：`history.jpg` 中的 `History` 就是历史记录，不是课程/学科选择器。它用于让长期使用后的用户，在大量学习资料、生成卡组、保存笔记和学习记录中快速搜索并回到某一份资料。点击后页面背景变暗，从底部弹出一个圆角 bottom sheet：

- sheet 标题是 `History`。
- 右上角是关闭 `X`。
- 下方是一个 Search 输入框。
- 这个交互用于搜索用户真实历史记录。

闪学改版对应：

- Home 顶部 `History` 改为真实历史记录入口。
- 点击后弹出 History bottom sheet。
- 搜索范围只包含用户本地真实生成过的资料、保存过的 Notes、答题记录。
- 空历史时显示空状态，不展示示例课程、示例卡组或伪造记录。
- 点击资料历史进入对应卡组练习；点击答题记录进入 Progress。

## 2.2 Add 不是普通页面，而是创建类型 sheet

新增 `add.jpg` 说明：底部中间 Add 不是直接跳到上传页面，而是先弹出创建类型 bottom sheet：

- 背景变暗，但 Home 保持可见。
- sheet 里有两个大选项：`Cards / Create flashcards` 与 `Notes / Create freeform notes`。
- 选中的选项有蓝色描边。
- 底部是深色大按钮 `Continue`。
- 底部导航中间按钮从绿色加号变成白底 `X`。

闪学改版对应：

- Add 按钮先打开 Cards / Notes 选择 sheet。
- Continue 后进入对应创建流程。
- Cards 会进入资料导入和闪卡生成。
- Notes 会进入自由笔记编辑和保存。
- 两个流程都写入本地数据，不再只是 UI。

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
- My decks 只展示用户真实生成的本地卡组和 Notes。
- Public decks 在后端内容库、审核和发布系统未接入前显示未配置空状态，不展示假公共卡组。
- 真实卡组采用左侧彩色竖条和卡数标签。
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
- 增加基于真实本地学习行为的 Level、XP、streak、日历、Start streak 按钮。
- 增加 Deck progress 和答题 Activity，数据来自真实卡片与答题记录。
- 好友排行榜、学习小组和 Following 需要账号、云端同步、隐私控制和审核能力，未接入前只显示未配置说明，不展示假用户。

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
