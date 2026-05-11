# 技术架构

## 1. 推荐技术栈

- 客户端：Flutter 或 React Native。若团队已有 Web/React 能力，优先 React Native + Expo；若强调性能和多端一致，优先 Flutter。
- 后端：Node.js/NestJS 或 Python/FastAPI。
- 数据库：PostgreSQL。
- 缓存与队列：Redis + BullMQ/Celery。
- 对象存储：阿里云 OSS/腾讯云 COS。
- 搜索与向量：OpenSearch/Elasticsearch + pgvector 或专用向量库。
- AI 网关：统一封装国内合规模型、OCR、ASR、内容审核。
- 监控：Sentry、Prometheus/Grafana、云日志。

## 2. 服务模块

- auth-service：账号、登录、设备、年龄分层。
- import-service：文件上传、解析、OCR、ASR。
- generation-service：知识切分、卡片生成、题目生成、解释。
- learning-service：测验、记忆调度、学习记录。
- social-service：小组、分享、邀请、排行榜。
- safety-service：内容审核、用户举报、风控。
- billing-service：订阅、额度、订单、退款。
- analytics-service：事件埋点、实验、指标。

## 3. AI 调用链

1. 用户上传资料。
2. safety-service 做文件类型、大小、敏感内容初筛。
3. import-service 提取文本和结构。
4. generation-service 调用模型生成知识点和卡片。
5. safety-service 审核生成结果。
6. learning-service 保存卡片和复习计划。
7. 客户端展示审阅页。

## 4. 权限模型

- 私密资料默认仅本人可见。
- 分享卡组生成只读副本或引用权限。
- 小组成员可学习共享卡组，但不能修改原始资料。
- 公开卡组必须审核后进入市场。
- 删除资料时必须删除或匿名化关联解析文本、向量和生成卡片。

## 5. 事件埋点

- signup_completed
- import_started
- import_completed
- cards_generated
- card_edited
- quiz_started
- quiz_answered
- explanation_opened
- review_completed
- group_created
- subscription_started
- safety_report_submitted

所有埋点不得记录完整题干、答案、个人隐私和用户上传原文；需要内容质量分析时使用脱敏样本和授权流程。

