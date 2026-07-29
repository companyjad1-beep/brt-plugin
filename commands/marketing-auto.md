---
description: "마케팅 자동화 하네스 — 주제 삼각측량→채널별 배치 생산→브라우저 성과 수집→분석·개선 순환 (batch·collect·report)"
argument-hint: "[batch|collect|report] [주제·지시] · 생략 시 batch"
---
`${CLAUDE_PLUGIN_ROOT}/skills/marketing-auto/SKILL.md`를 읽고, `$ARGUMENTS`의 첫 토큰으로 모드를 판별해 실행하라:

- `collect` → **collect 모드** — collect.md 로드, 브라우저로 4채널 지표 수집.
- `report` → **report 모드** — report.md 로드, 장부 분석·골격 승격/도태·다음 배치 권고.
- `publish` → 미구현 예약석 — "게시는 수동, publish는 아직 없음"이라고 답한다.
- `batch` → **batch 모드** — 그 토큰은 **소비하고**, 나머지 `$ARGUMENTS`를 주제·지시로 쓴다("batch"를 주제로 오해하지 않는다).
- 그 외/생략 → **batch 모드** — SKILL.md 파이프라인 8단계. `$ARGUMENTS` 전체를 주제·채널 지시로 사용한다(사용자 제공 주제는 리서치 생략, 검증만).

해당 모드에 필요한 문서만 로드한다. batch는 시작 전에 SKILL.md와 research.md를 Read로 다시 읽는다 — 기억으로 실행 금지.

사용자 추가 지시: $ARGUMENTS
