#!/usr/bin/env node
// 모든 스킬의 원본은 이 플러그인의 skills/ — 여기서 직접 수정하고 push하면 끝. 별도 동기화 없음.
//   - Claude Code 사용자: 플러그인 설치/업데이트로 받음
//   - GJC 런타임: ~/.gjc/skills/store-shots/SKILL.md 가 이 폴더를 가리키는 1회성 스텁(바로가기)이라 항상 최신을 읽음
//   - 로컬 보관소(0.skill/imgprmpt 평가 금고, 0.skill/store-shots 개발 자산)는 스킬 파일이 아님
// 이 스크립트의 유일한 잔여 역할: builder.html 수급 (원본이 newz 레포라서 — newz 쪽이 바뀔 때만 실행)
import { cpSync } from 'node:fs';

cpSync('D:/business/programming/newz/public/brtimg/builder.html', 'assets/brtimg/builder.html');
console.log('builder.html fetched');
