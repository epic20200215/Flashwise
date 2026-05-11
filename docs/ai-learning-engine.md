# AI 学习引擎设计

## 1. 模块

- 资料解析：OCR、文档抽取、音频转写、网页正文抽取。
- 知识切分：按标题、段落、概念、公式、例题切分。
- 卡片生成：生成问答、术语、填空、正误、步骤排序。
- 题目生成：基于卡片生成多题型题目与干扰项。
- 解释生成：答错后生成短解释、类比、来源引用。
- 记忆调度：计算掌握度和下次复习时间。
- 安全与质量：内容审核、事实追溯、重复检测、难度控制。

## 2. 数据结构

### SourceDocument

- id
- owner_user_id
- title
- type
- storage_uri
- parsed_text_uri
- created_at
- safety_status

### KnowledgeChunk

- id
- source_document_id
- page_or_timestamp
- text
- heading_path
- embedding_id

### Flashcard

- id
- deck_id
- question
- answer
- explanation
- source_chunk_ids
- tags
- difficulty
- mastery_score
- next_review_at

### QuizAttempt

- id
- user_id
- flashcard_id
- question_type
- is_correct
- response
- latency_ms
- hint_used
- created_at

## 3. 生成策略

1. 先抽取知识点，再生成卡片，不直接从整篇文档一次性生成。
2. 每张卡片必须保留来源 chunk。
3. 干扰项必须来自同一学科或相近概念，不能明显错误。
4. 对数学、物理、化学、医学等高风险内容，解释必须提示“以教材/老师要求为准”。
5. 如果来源不足，不得编造；应生成“资料中未找到依据”。

## 4. 记忆调度

MVP 使用可解释的 SM-2 变体：

- 正确且反应快：提高熟练度，延长间隔。
- 正确但慢或用了提示：小幅延长。
- 错误：降低熟练度，短间隔回炉。
- 考试日期临近：对高权重和错题提高出现频率。

调度输入：

- 最近答题结果
- 连续正确次数
- 反应时间
- 题型
- 用户自评
- 考试日期
- 卡片难度

## 5. AI 导师安全提示词原则

- 优先解释概念，不直接代写作业。
- 对未成年人使用更短、更温和、更鼓励自答的解释。
- 不生成政治违法、暴力、色情、歧视、作弊、侵犯隐私内容。
- 对不确定内容明确说明不确定。
- 保留提示词版本，便于回溯和 A/B 测试。

