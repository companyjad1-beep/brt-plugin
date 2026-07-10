---
description: "Fable 5급 이미지·영상 프롬프트 하네스 (brtimg — build·new·refine·series·character·eval)"
argument-hint: "[build|new|refine|series|character|eval] <입력> · 생략 시 build"
---
`${CLAUDE_PLUGIN_ROOT}/skills/brtimg/SKILL.md`를 읽고, `$ARGUMENTS`의 첫 토큰으로 모드를 판별해 `${CLAUDE_PLUGIN_ROOT}/skills/brtimg/commands/<모드>.md`의 계약대로 수행하라:

- 모드: `build`(기본) · `new` · `refine` · `series` · `character` · `eval`
- 첫 토큰이 위 모드명이면 그 모드로, 아니면/생략이면 `build`로 실행한다.
- 나머지 인자는 해당 커맨드의 입력(`idea`, `media`, `characterSheet`, `refs`, `generator` 등)으로 그대로 전달한다.

`core/...` 상대 경로는 `${CLAUDE_PLUGIN_ROOT}/skills/brtimg/core/...`로 해석한다. `holdout-eval/`에는 접근하지 않는다.
