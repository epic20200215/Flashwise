import test from 'node:test';
import assert from 'node:assert/strict';
import {
  dueCards,
  exportCsv,
  generateCardsFromText,
  gradeAnswer,
  mastery,
  scheduleCard,
  seedText
} from '../src/core.js';

test('generates traceable cards from Chinese study text', () => {
  const cards = generateCardsFromText(seedText, '测试卡组');
  assert.ok(cards.length >= 3);
  assert.ok(cards.every((card) => card.source.length > 0));
  assert.ok(cards.every((card) => card.question.includes('____') || card.question.includes('请回忆')));
});

test('grades flexible keyword answers', () => {
  assert.equal(gradeAnswer('间隔重复', '间隔重复'), true);
  assert.equal(gradeAnswer('重复', '间隔重复'), true);
  assert.equal(gradeAnswer('', '间隔重复'), false);
});

test('schedules cards by rating', () => {
  const [card] = generateCardsFromText(seedText);
  const good = scheduleCard(card, 4, 1000);
  const again = scheduleCard(card, 1, 1000);
  assert.ok(good.dueAt > again.dueAt);
  assert.equal(good.reps, 1);
  assert.equal(again.lapses, 1);
});

test('calculates due cards and mastery', () => {
  const cards = generateCardsFromText(seedText);
  assert.ok(dueCards(cards, Date.now()).length > 0);
  assert.ok(mastery(cards) >= 0);
});

test('exports csv', () => {
  const csv = exportCsv(generateCardsFromText(seedText).slice(0, 2));
  assert.ok(csv.startsWith('question,answer,source,tags'));
  assert.ok(csv.includes('\n'));
});
