---
description: "마케팅 자동화 하네스 — 채널 공용 신규 리서치→의미 중복 차단→채널별 생산(write), 명시적 배치 계획(batch), 성과 수집·분석"
argument-hint: "[write|batch|recycle|collect|report|engage] [편수·주제·지시] · 일반 글 요청/생략 시 write"
---
`${CLAUDE_PLUGIN_ROOT}/skills/marketing-auto/SKILL.md`를 읽고, `$ARGUMENTS`의 첫 토큰과 아래의 명시적 자연어 의도로 모드를 판별해 실행하라:

- `collect` → **collect 모드** — collect.md 로드, 브라우저로 4채널 지표 수집.
- `report` → **report 모드** — report.md 로드, 장부 분석·골격 승격/도태·다음 생산(write) 권고.
- `engage` → **engage 모드** — SKILL.md §engage. 오늘 뜨는 도메인 글 표적 수집→답글 초안(brtwritenotai 답글 모드)→전문 출력·기록.
- `publish` → 미구현 예약석 — "게시는 수동, publish는 아직 없음"이라고 답한다.
- `write` → 토큰을 소비하고 나머지 인자를 신규 생산 지시로 쓴다. 채널 생략 시 쓰레드, 채널 명시 시 해당 채널로 제작한다.
- `batch` → 토큰을 소비하고 기존 승인형 배치 생산을 실행한다.
- `recycle` 첫 토큰, 또는 report가 지목한 기존 글을 가리키며 "이 글 재활용/재발행"처럼 재활용을 명시한 자연어 요청 → **recycle 모드**. 토큰이 있으면 소비하고, report 추천과 사용자 명시 요청이 모두 확인된 그 글만 실행한다. 둘 중 하나라도 없으면 recycle로 실행하지 않는다.
- 그 외/생략 → **write 모드**. 일반적인 "새 글", "쓰레드 글 N개" 요청을 신규 생산 지시로 사용하며, 채널을 생략한 일반 새 글은 쓰레드로 제작한다.

해당 모드에 필요한 문서만 로드한다. write와 batch는 시작 전에 SKILL.md와 research.md를 Read로 다시 읽는다 — 기억으로 실행 금지. threads-ops.md는 쓰레드 제작 분기에서만 로드한다.

사용자 추가 지시: $ARGUMENTS
