export const DAY_MS = 24 * 60 * 60 * 1000;

export const seedText = `间隔重复是一种根据遗忘曲线安排复习的学习方法。主动回忆要求学习者先尝试从记忆中提取答案，而不是直接重读材料。生成式人工智能可以把笔记、课件和讲义转化为闪卡，但学习产品必须保留来源片段，避免编造。中国大陆上线 AI 教育产品时，需要关注未成年人保护、个人信息保护、算法推荐和生成式人工智能服务规则。`;

export function uid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}_${Date.now().toString(36)}`;
}

export function splitIntoChunks(text) {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .split(/(?<=[。！？.!?；;])\s*/)
    .map((item) => item.trim())
    .filter((item) => item.length >= 8)
    .slice(0, 16);
}

export function keywordOf(sentence) {
  const matches = sentence.match(/[A-Za-z0-9\u4e00-\u9fa5]{2,}/g) || [];
  const blacklist = new Set(['一种', '可以', '需要', '以及', '不是', '直接', '材料', '产品']);
  const sorted = matches
    .filter((word) => !blacklist.has(word))
    .sort((a, b) => b.length - a.length);
  return sorted[0] || sentence.slice(0, 4);
}

export function generateCardsFromText(text, title = '智能导入卡组') {
  const chunks = splitIntoChunks(text);
  const now = Date.now();
  return chunks.map((chunk, index) => {
    const keyword = keywordOf(chunk);
    const answer = keyword;
    const question = buildQuestion(chunk, keyword);
    return {
      id: uid('card'),
      deckId: 'deck_ai',
      deckTitle: title,
      question,
      answer,
      source: chunk,
      explanation: `这张卡来自原文片段：“${chunk}”。闪学会优先让你先回忆，再展示解释。`,
      tags: inferTags(chunk),
      createdAt: now + index,
      dueAt: now,
      stability: 1,
      difficulty: 5,
      reps: 0,
      lapses: 0,
      lastResult: 'new'
    };
  });
}

export function buildQuestion(chunk, keyword) {
  if (chunk.includes(keyword)) {
    return chunk.replace(keyword, '____');
  }
  return `请回忆这个知识点：${chunk.slice(0, 28)}...`;
}

export function inferTags(text) {
  const tags = [];
  if (/AI|人工智能|生成式/.test(text)) tags.push('AI');
  if (/间隔|遗忘|记忆|复习|主动回忆/.test(text)) tags.push('记忆法');
  if (/中国|大陆|未成年人|算法|个人信息|合规/.test(text)) tags.push('合规');
  if (tags.length === 0) tags.push('知识点');
  return tags;
}

export function makeOptions(card, allCards) {
  const distractors = allCards
    .filter((item) => item.id !== card.id)
    .map((item) => item.answer)
    .filter(Boolean);
  const fallback = ['不符合原文', '无法从材料判断', '另一个知识点', '以上都不是'];
  const unique = [...new Set([...distractors, ...fallback])].filter((item) => item !== card.answer);
  const options = shuffle([card.answer, ...unique.slice(0, 3)]);
  return options;
}

export function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

export function gradeAnswer(input, answer) {
  const cleanInput = String(input || '').trim().toLowerCase();
  const cleanAnswer = String(answer || '').trim().toLowerCase();
  if (!cleanInput) return false;
  return cleanInput === cleanAnswer || cleanAnswer.includes(cleanInput) || cleanInput.includes(cleanAnswer);
}

export function scheduleCard(card, rating, now = Date.now()) {
  const normalized = Math.max(1, Math.min(4, Number(rating) || 1));
  const isFail = normalized === 1;
  const difficultyDelta = isFail ? 0.8 : -0.25 * normalized;
  const nextDifficulty = clamp(card.difficulty + difficultyDelta, 1, 10);
  const stabilityGain = isFail ? 0.45 : 1 + normalized * 0.72 + Math.max(0, 6 - nextDifficulty) * 0.08;
  const nextStability = isFail ? Math.max(0.5, card.stability * stabilityGain) : card.stability * stabilityGain;
  const intervalDays = isFail ? 0.02 : clamp(Math.round(nextStability), 1, 90);
  return {
    ...card,
    difficulty: round(nextDifficulty),
    stability: round(nextStability),
    dueAt: now + intervalDays * DAY_MS,
    reps: card.reps + 1,
    lapses: card.lapses + (isFail ? 1 : 0),
    lastResult: isFail ? 'again' : normalized >= 3 ? 'good' : 'hard'
  };
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function round(value) {
  return Math.round(value * 100) / 100;
}

export function mastery(cards) {
  if (cards.length === 0) return 0;
  const score = cards.reduce((sum, card) => sum + clamp(card.stability * 10 - card.difficulty * 2, 0, 100), 0);
  return Math.round(score / cards.length);
}

export function dueCards(cards, now = Date.now()) {
  return cards
    .filter((card) => card.dueAt <= now)
    .sort((a, b) => a.dueAt - b.dueAt || b.difficulty - a.difficulty);
}

export function exportCsv(cards) {
  const header = ['question', 'answer', 'source', 'tags'];
  const rows = cards.map((card) =>
    [card.question, card.answer, card.source, card.tags.join('|')]
      .map((field) => `"${String(field).replace(/"/g, '""')}"`)
      .join(',')
  );
  return [header.join(','), ...rows].join('\n');
}
