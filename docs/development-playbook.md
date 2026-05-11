# 开发执行手册

## 1. 团队分工

- Product：维护 PRD、路线图、指标、用户反馈。
- Design：维护设计系统、原型、可用性测试。
- Client：移动端页面、状态管理、离线缓存、埋点。
- Backend：账号、资料、卡组、测验、复习、小组、支付。
- AI：解析、生成、提示词、评测、模型网关。
- Safety：内容审核、未成年人保护、隐私、举报后台。
- QA：测试用例、自动化、灰度验收。

## 2. 代码仓库建议结构

```text
apps/
  mobile/
  admin/
services/
  api/
  worker/
  ai-gateway/
packages/
  shared/
  design-tokens/
docs/
```

## 3. API 草案

- `POST /auth/login`
- `POST /documents/upload`
- `GET /documents/:id`
- `POST /documents/:id/generate-cards`
- `GET /decks`
- `POST /decks`
- `PATCH /cards/:id`
- `POST /quiz/sessions`
- `POST /quiz/sessions/:id/answers`
- `GET /reviews/today`
- `POST /groups`
- `POST /groups/:id/invite`
- `POST /reports`
- `DELETE /account`

## 4. 研发约束

- 所有接口必须校验用户是否拥有资源权限。
- 所有异步 AI 任务必须可重试、可取消、可追踪。
- 所有用户上传文件必须经过类型、大小、安全检查。
- 所有公开内容必须经过审核状态机。
- 所有模型输出必须记录 prompt version、model version、source ids。

## 5. Definition of Done

一个功能完成必须同时满足：

- PRD 验收点通过。
- 有基础单元测试或集成测试。
- 有埋点。
- 有错误态、空态、加载态。
- 涉及 AI 输出时通过评测集抽检。
- 涉及个人信息、未成年人、支付、公开内容时通过合规检查。

## 6. 风险清单

- AI 生成质量不稳定：用来源映射、审阅页、评测集和纠错闭环控制。
- 导入失败率高：优先支持最常见格式，长文档分段处理。
- 用户只导入不复习：新用户完成导入后自动进入 5 题体验。
- 游戏化被认为诱导沉迷：未成年人模式弱化排行榜和生命值。
- 版权投诉：公开卡组审核、权利人投诉和下架机制。
- 合规滞后：上线前锁定生成式 AI、算法推荐、App 备案、隐私、未成年人检查。

