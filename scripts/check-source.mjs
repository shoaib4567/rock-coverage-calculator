import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function findConflictMarkers(source) {
  const markers = [];
  source.split(/\r?\n/).forEach((line, index) => {
    if (/^(?:<{7}|>{7}|\|{7})(?:\s|$)/.test(line) || /^={7}\s*$/.test(line)) markers.push(index + 1);
  });
  return markers;
}

export async function scanProject(root) {
  const problems = [];
  async function scan(target) {
    const stat = await fs.stat(target).catch(error => { if (error.code === 'ENOENT') return null; throw error; });
    if (!stat) return;
    if (stat.isDirectory()) {
      for (const name of await fs.readdir(target)) await scan(path.join(target, name));
    } else if (/\.(?:astro|[cm]?[jt]sx?|json|css|html|xml|txt|svg|ya?ml)$/.test(target)) {
      const lines = findConflictMarkers(await fs.readFile(target, 'utf8'));
      if (lines.length) problems.push({ file: path.relative(root, target).replaceAll('\\', '/'), lines });
    }
  }
  for (const target of ['src', 'public', 'scripts', 'tests', '.github', 'package.json', 'package-lock.json', 'astro.config.mjs', 'tsconfig.json', 'vercel.json', 'server.js']) await scan(path.join(root, target));
  return problems;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const problems = await scanProject(process.cwd());
  if (problems.length) {
    console.error('Unresolved Git merge conflicts. Resolve these before building:');
    for (const {file,lines} of problems) console.error(`${file}:${lines.join(',')}`);
    process.exitCode = 1;
  } else console.log('Source check passed: no unresolved merge conflicts.');
}
