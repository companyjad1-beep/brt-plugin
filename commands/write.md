---
description: "AI 티 없는 한국어 글쓰기 하네스 (brtwritenotai — write·polish·check·voice·help)"
argument-hint: "[polish|check|voice|help] <내용> · 생략 시 write"
---
`${CLAUDE_PLUGIN_ROOT}/skills/brtwritenotai/SKILL.md`를 읽고, `$ARGUMENTS`의 첫 토큰으로 모드를 판별해 SKILL.md의 "모드 → core 로드 맵"대로 실행하라:

- `polish <글>` → **polish 모드** (뭘 왜 바꿨는지 전부 표시)
- `check <글>` → **check 모드** (수정 없이 AI티 판정 + 티 밀도 버킷)
- `voice <내가 쓴 글 3~5개>` → **voice 모드** (말투 카드 등록, 이후 write/polish에 자동 적용)
- `help` → **help 모드** (치트시트만 출력하고 끝, 다른 작업 없음)
- 그 외/생략 → **write 모드**. 전체 `$ARGUMENTS`를 주제·채널·말투·프리셋·실측 데이터로 사용하고, 부족하면 Phase 0/1 인터뷰 규칙대로 부족한 것만 질문한다.

해당 모드에 필요한 core 문서만 로드한다(불필요한 로드 금지).
