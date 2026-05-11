import { readFileSync } from 'node:fs';

const app = readFileSync('src/app.js', 'utf8');
const core = readFileSync('src/core.js', 'utf8');

const requiredExports = ['generateCardsFromText', 'scheduleCard', 'dueCards', 'exportCsv'];
for (const name of requiredExports) {
  if (!core.includes(`export function ${name}`)) {
    throw new Error(`Missing core export: ${name}`);
  }
}

for (const selector of ['#app', 'data-action', 'data-tab']) {
  if (!app.includes(selector)) {
    throw new Error(`Missing app selector or binding: ${selector}`);
  }
}

console.log('Static typecheck passed.');
