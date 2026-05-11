# 闪学产品与研发文档包

本目录是“闪学”大模型学习应用的开发前置文档。目标是参考 Gizmo 的产品设计与增长经验，结合中国大陆用户、政策、渠道和内容环境，设计一款可开发、可合规上线的中文同类产品。

## 文档索引

- [agent.md](agent.md)：开发最高规则，所有研发、产品、设计、内容、智能代理都应优先遵守。
- [docs/research/gizmo-research.md](docs/research/gizmo-research.md)：Gizmo 深度研究、来源清单与可迁移经验。
- [docs/product-plan.md](docs/product-plan.md)：闪学产品策划案，包含定位、用户、功能、商业化、增长。
- [docs/prd.md](docs/prd.md)：最小可用版本产品需求文档。
- [docs/design-system.md](docs/design-system.md)：扁平化简约美术风格与 UI 规则。
- [docs/ai-learning-engine.md](docs/ai-learning-engine.md)：大模型出题、记忆调度、讲解与安全策略。
- [docs/technical-architecture.md](docs/technical-architecture.md)：推荐技术架构、模块边界与数据模型。
- [docs/compliance-mainland-china.md](docs/compliance-mainland-china.md)：中国大陆发行合规清单。
- [docs/milestones.md](docs/milestones.md)：开发计划、里程碑与验收口径。
- [docs/qa-and-launch.md](docs/qa-and-launch.md)：测试、灰度、上线与运营指标。
- [docs/android-packaging.md](docs/android-packaging.md)：Android 打包路线和 OCKI 可参考文件说明。
- [docs/completion-audit.md](docs/completion-audit.md)：当前交付完成审计。
- [docs/mobile-redesign-audit.md](docs/mobile-redesign-audit.md)：对照 Gizmo 截图后的手机竖版改版审计。
- [docs/integration-requirements.md](docs/integration-requirements.md)：云服务器、大模型、拍照识别、语音转写、账号和上线合规的配置需求表。

## 当前可运行版本

本仓库已包含一个零依赖网页应用版本，覆盖闪学最小可用版本核心闭环：

- 今日复习与掌握率。
- 粘贴、文本文件、照片文字或视频笔记生成带来源片段的记忆卡。
- 历史记录搜索真实本地资料、笔记和答题记录，不展示本地假数据。
- 手机竖版信息架构：首页 / 进度 / 新建 / 卡组 / 我的。
- 桌面网页提供手机预览画布，可切换紧凑屏、标准屏、大屏和长屏，并自动缩放到当前窗口内，保证底部导航也能完整看到。
- 选择题、填空题、翻卡练习。
- 间隔重复风格的复习调度。
- 笔记保存、卡片编辑删除、本地进度、表格导出和未成年人保护模式。
- 公共卡组、好友排行榜、云端同步、拍照识别、语音转写和真实大模型生成功能已在产品内标记为“未配置”，等待后端与云服务接入后启用。

## 本地命令

```powershell
npm.cmd run dev
npm.cmd run lint
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
```

开发服务默认地址：

```text
http://localhost:4173
```

## 核心结论

闪学不应逐像素复制 Gizmo，也不应复制其商标、素材、文案或受保护资产。应复用其被验证的产品机制：资料导入到卡片、主动回忆、间隔重复、游戏化反馈、同伴学习和低门槛智能助教，并针对中国大陆做课程体系、合规、内容安全和渠道本地化。
