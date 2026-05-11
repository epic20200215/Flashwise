import { copyFileSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';

const dist = 'dist';
rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

for (const item of ['index.html', 'manifest.webmanifest', 'service-worker.js', 'src', 'images', 'docs', 'agent.md', 'README.md']) {
  copyRecursive(item, join(dist, item));
}

console.log('Built dist/ for static hosting.');

function copyRecursive(source, target) {
  const stats = statSync(source);
  if (stats.isDirectory()) {
    mkdirSync(target, { recursive: true });
    for (const child of readdirSync(source)) {
      copyRecursive(join(source, child), join(target, child));
    }
    return;
  }
  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(source, target);
}
