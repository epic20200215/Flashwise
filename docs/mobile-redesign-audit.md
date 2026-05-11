# 手机竖版改版完成审计

审计日期：2026-05-11

## 用户目标拆解

1. 对照用户提供的 Gizmo 截图和视频重新分析研究。
2. 重新优化闪学，缩小与 Gizmo 的产品设计差距。
3. 明确突出最重要的“上传资料”。
4. 明确突出游戏化设计。
5. UI 必须做成手机端竖版 App，而不是 Web 端页面。

## 证据清单

| 要求 | 证据 |
| --- | --- |
| 分析 Gizmo 截图 | `docs/research/gizmo-screenshot-analysis.md` 已逐页分析 Home、Decks、Progress、Profile |
| 参考视频素材 | `docs/research/gizmo video.mp4` 已确认存在，并通过本地 HTML 播放页截取首帧核对 Home 上传入口和底部导航 |
| 上传资料突出 | `src/app.js` 的 Home 首屏有“今天学什么？”、学习输入卡、卡组/上传/拍照/粘贴/视频/更多按钮；Add 页有“上传资料，马上开考”和文件/拍照/粘贴/视频入口 |
| 游戏化突出 | `src/app.js` 的 Progress 页包含 Level、XP、streak、日历、Start streak、排行榜、学习小组和 Following 动态 |
| 竖版手机 App | `src/styles.css` 使用 `width: min(100vw, 430px)`、`max-height: 100vh`、固定底部导航和手机视口布局 |
| Gizmo 式导航 | `src/app.js` 底部导航为 Home / Progress / Add / Decks / Profile，Add 位于中间 |
| Decks 对齐 | `src/app.js` Decks 页有 My decks / Public decks、筛选 chip、彩色竖条卡片和悬浮加号 |
| Profile 对齐 | `src/app.js` Profile 页有居中标题、头像编辑、分组设置卡片和隐私开关 |

## 验证命令

```powershell
npm.cmd run verify
```

结果：通过。

## 本地运行验证

- `http://localhost:4173/src/app.js` 返回 200，包含 `上传资料，马上开考` 和 `Start your streak!`。
- `http://localhost:4173/src/styles.css` 返回 200，包含 `.bottom-nav`、`.add-tab` 和手机竖版 shell。
- 内置浏览器已打开 `http://localhost:4173/` 并设置为 `393 x 852` 手机视口。

## 版权与素材处理

用户提供的 Gizmo 截图和视频是第三方产品研究素材，只在本地 `docs/research` 目录分析使用，不提交到 GitHub 仓库。
