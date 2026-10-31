import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { findConflictMarkers } from '../scripts/check-source.mjs';

test('source check detects ordinary and diff3 conflict markers with either line ending', () => {
  const lines = ['<'.repeat(7) + ' HEAD', 'const local = true;', '|'.repeat(7) + ' base', 'const base = true;', '='.repeat(7), 'const incoming = true;', '>'.repeat(7) + ' incoming'];
  assert.deepEqual(findConflictMarkers(lines.join('\n')), [1,3,5,7]);
  assert.deepEqual(findConflictMarkers(lines.join('\r\n')), [1,3,5,7]);
  assert.deepEqual(findConflictMarkers('const compare = a < b;\n/* ======== */\n====== ordinary heading\n'), []);
});

test('source check fails the command before compilation when a project contains conflict markers', async () => {
  const fixture = await fs.mkdtemp(path.join(os.tmpdir(), 'rock-source-check-'));
  try {
    await fs.mkdir(path.join(fixture, 'src'));
    const file = path.join(fixture, 'src', 'page.astro');
    await fs.writeFile(file, ['<'.repeat(7) + ' HEAD', 'content', '='.repeat(7), 'incoming', '>'.repeat(7) + ' branch'].join('\n'));
    const command = path.resolve('scripts/check-source.mjs');
    const failed = spawnSync(process.execPath, [command], { cwd: fixture, encoding: 'utf8' });
    assert.equal(failed.status, 1);
    assert.match(failed.stderr, /src\/page\.astro:1,3,5/);
    await fs.writeFile(file, '<main><h1>Resolved page</h1></main>');
    const passed = spawnSync(process.execPath, [command], { cwd: fixture, encoding: 'utf8' });
    assert.equal(passed.status, 0);
  } finally {
    const resolvedFixture = path.resolve(fixture);
    const tempRoot = path.resolve(os.tmpdir());
    if (path.dirname(resolvedFixture) !== tempRoot || !path.basename(resolvedFixture).startsWith('rock-source-check-')) throw Error('Unexpected fixture cleanup path');
    await fs.rm(resolvedFixture, { recursive: true, force: true });
  }
});
