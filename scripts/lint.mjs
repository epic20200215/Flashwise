import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const targets = ['src', 'scripts', 'tests'];
const errors = [];

function walk(dir) {
  for (const item of readdirSync(dir)) {
    const path = join(dir, item);
    if (statSync(path).isDirectory()) walk(path);
    else if (/\.(js|mjs|css|html)$/.test(path)) check(path);
  }
}

function check(path) {
  const text = readFileSync(path, 'utf8');
  if (text.includes('\t')) errors.push(`${path}: tabs are not allowed`);
  if (/[ \t]+$/m.test(text)) errors.push(`${path}: trailing whitespace`);
  if (!text.endsWith('\n')) errors.push(`${path}: missing final newline`);
}

targets.forEach((target) => walk(target));

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log('Lint passed.');
