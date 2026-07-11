#!/usr/bin/env node
// SOT: brtimg = 0.skill/imgprmpt / store-shots = 0.skill/store-shots
// kickoff·marketing-plan·brtwritenotai는 이 플러그인이 원본 — skills/에서 직접 수정 (2026-07-11 이관, sync 대상 아님)
// 이 플러그인은 배포 스냅샷 — SOT 수정 후 `node sync.mjs`로 갱신한다.
import { cpSync, rmSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

const NEWZ = 'D:/business/programming/newz';
const IMG = 'D:/business/programming/0.skill/imgprmpt';
const SHOT = 'D:/business/programming/0.skill/store-shots';

// builder.html
cpSync(join(NEWZ, 'public/brtimg/builder.html'), 'assets/brtimg/builder.html');

// brtimg (어댑터 + 커맨드 계약 + core, holdout 격리 유지)
cpSync(join(IMG, '.claude/skills/brtimg/SKILL.md'), 'skills/brtimg/SKILL.md');
rmSync('skills/brtimg/commands', { recursive: true, force: true });
cpSync(join(IMG, '.claude/skills/brtimg/commands'), 'skills/brtimg/commands', { recursive: true });
rmSync('skills/brtimg/core.new', { recursive: true, force: true });
cpSync(join(IMG, 'core'), 'skills/brtimg/core.new', { recursive: true });
rmSync('skills/brtimg/core.new/style-library/golden-set/holdout-eval', { recursive: true, force: true }); // 격리 유지
rmSync('skills/brtimg/core', { recursive: true, force: true });
cpSync('skills/brtimg/core.new', 'skills/brtimg/core', { recursive: true });
rmSync('skills/brtimg/core.new', { recursive: true, force: true });

// store-shots (SOT = 0.skill/store-shots — SKILL + 렌더러/설정 예시 번들)
rmSync('skills/store-shots', { recursive: true, force: true });
cpSync(join(SHOT, '.claude/skills/store-shots'), 'skills/store-shots', { recursive: true });
cpSync(join(SHOT, 'generate.py'), 'skills/store-shots/generate.py');
cpSync(join(SHOT, 'config.example.yaml'), 'skills/store-shots/config.example.yaml');

// ~/.gjc 사용자 스킬도 같은 SOT에서 동기화 (GJC 런타임용 — 로컬 절대경로 버전 그대로)
cpSync(join(SHOT, '.claude/skills/store-shots'), join(homedir(), '.gjc/skills/store-shots'), { recursive: true });

// 플러그인 내부 경로 보정 (brtimg 어댑터만 — brtwritenotai는 스킬-폴더 상대 경로라 패치 불요)
const patch = (path, pairs) => {
  let t = readFileSync(path, 'utf-8');
  for (const [from, to] of pairs) t = t.split(from).join(to);
  writeFileSync(path, t);
};
patch('skills/brtimg/SKILL.md', [
  ['- 모든 상대 경로는 저장소 루트 기준으로 해석한다.',
   '- **플러그인 환경 경로 규칙**: `core/...` 상대 경로는 전부 이 스킬 폴더 기준(`${CLAUDE_PLUGIN_ROOT}/skills/brtimg/core/...`)으로 해석한다. 산출물 `workspace/...`는 호스트 프로젝트 루트 기준이다.'],
]);
// store-shots 플러그인 스냅샷은 번들 경로 사용 (파일 경로 치환 + SOT 안내 문구를 외부 설치자용으로 치환)
patch('skills/store-shots/SKILL.md', [
  ['D:/business/programming/0.skill/store-shots/generate.py', '${CLAUDE_PLUGIN_ROOT}/skills/store-shots/generate.py'],
  ['D:/business/programming/0.skill/store-shots/config.example.yaml', '${CLAUDE_PLUGIN_ROOT}/skills/store-shots/config.example.yaml'],
  ['- 렌더러(`generate.py`) 자체의 버그/개선은 SOT인 `D:/business/programming/0.skill/store-shots` 레포에서 수정한다.',
   '- 렌더러(`generate.py`)를 이 플러그인 폴더에서 직접 수정하지 않는다 — 스냅샷이라 다음 배포 때 덮어써진다. 버그·개선 제안은 플러그인 레포(github.com/companyjad1-beep/brt-plugin) 이슈로.'],
]);
console.log('SYNCED');
