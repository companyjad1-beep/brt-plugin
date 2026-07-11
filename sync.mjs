#!/usr/bin/env node
// 모든 스킬의 원본은 이 플러그인의 skills/ — 여기서 직접 수정하고 push한다 (2026-07-11 통합).
// 예외 보관소: 0.skill/imgprmpt(평가 금고: holdout·실험), 0.skill/store-shots(리서치·테스트 픽스처) — 스킬 파일 아님.
// 이 스크립트가 하는 일 두 가지:
//   ① builder.html 수급 (원본: newz 레포)
//   ② store-shots GJC 설치본 갱신 — GJC 런타임은 ${CLAUDE_PLUGIN_ROOT}가 없어 절대경로로 치환해 ~/.gjc에 설치
import { cpSync, rmSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

const NEWZ = 'D:/business/programming/newz';
const PLUGIN = 'D:/business/programming/0.skill/brt-plugin';

// ① builder.html
cpSync(join(NEWZ, 'public/brtimg/builder.html'), 'assets/brtimg/builder.html');

// ② store-shots → ~/.gjc (절대경로 치환)
const dest = join(homedir(), '.gjc/skills/store-shots');
rmSync(dest, { recursive: true, force: true });
cpSync('skills/store-shots', dest, { recursive: true });
for (const f of ['SKILL.md', 'PATTERNS.md']) {
  const p = join(dest, f);
  let t = readFileSync(p, 'utf-8');
  t = t.split('${CLAUDE_PLUGIN_ROOT}').join(PLUGIN);
  t = t.split('`skills/brtwritenotai/').join('`' + PLUGIN + '/skills/brtwritenotai/');
  writeFileSync(p, t);
}
console.log('SYNCED');
