# BRT Plugin Changelog

## 1.2.1 — 2026-08-03

- 훅 규칙 충돌 해소 — research.md 훅 선택을 write(자동 선택+대안 병기)/batch(사용자 선택 게이트)로 분리. 일반 write가 사용자 대기로 멈추던 결함 수정.
- 잔여 "다음 배치" 표현을 write 기본 취지에 맞게 정리(commands·SKILL·report·plugin.json 설명).
- 마켓플레이스 문서에 최상위 설명과 `/brt:marketing-auto` 진입 흐름을 추가해 1.2.1의 write 기본 동작을 설치 화면에서도 확인할 수 있게 정리.

## 1.2.0 — 2026-08-02

- marketing-auto: **write가 기본 생산 모드** — 요청 1회 = run, 신규 리서치 우선(topics.md는 후보 큐가 아니라 기억·증거 저장소), 의미 서명(독자 문제|핵심 주장|사례·근거|결론) 중복 게이트, 편별 사실팩 + 봉인된 작가 번들(이전 초안·장부 검색 금지), 무승인 12단계 자동 진행("주제부터 보여줘" 시만 후보표 정지), 훅 자동 선택 + 대안 2개 병기.
- 공용 주제팩(`topic-packs/`) + 명시적 채널 파생 — 채널 간 공유는 사실·출처·우리 재료만, 이전 채널 본문·문장·훅 상속 금지, 가격·시세 등 변동 사실은 파생 시점 재검증. 채널 미지정 write는 쓰레드.
- 재작성 오염 가드 — 재작성 게이트(주제·제품·사실 변경 = 새 편 생산), 잔존 검사(기계적 검색), brtwritenotai 슬롯 주제 일치 + polish 오라우팅 차단.
- recycle 모드 신설 — report가 지목한 땔감의 명시적 재발행 전용. report는 형식·훅·길이·골격만 승계하고 과거 주제를 자동 재생산하지 않는다(주제 방향은 검색 토큰으로만).
- batch는 명시 요청 전용으로 강등(승인형 계획·훅 게이트 유지). ledger에 의미서명·topic_pack_id·파생·리서치근거 칼럼 추가 — 미게시 초안도 중복 대조 대상.

## 1.1.0 — 2026-08-02

- 스킬 frontmatter에 시맨틱 버전 도입(`brtwritenotai`·`marketing-auto`), 플러그인 버전을 1.1.0으로 통일(구 0.4.x 승계).
- brtwritenotai: thread/reply 산출 시 `core/threads-ops.md`(런타임 미러 — SOT는 `marketing-auto/threads-ops.md`)를 로드하는 "Threads 운영 확장" 추가. 게시·댓글·팔로우 등 공개 행동은 사용자 승인 없이 실행하지 않는다.
- 실계정 ledger 실측이 이식된 타이밍·알고리즘 주장(빌리쌤 2026)보다 우선함을 명시.
- collect: 티스토리 채널 수집 행 + GA4 전환 측정(세션 채널·UTM) 추가. batch 생산에 카드뉴스 장면 재현 규칙 추가.
- (교정 이력: 이 항목의 초안에 threads-writer·brand-reviewer 스킬, one-post-one-claim류 게이트, Reviewer 체크가 기재돼 있었으나 실재하지 않아 삭제 — 2026-08-02 점검에서 확인.)

## 0.4.1 — 2026-08-02

- marketing-auto: PDF 전수 재점검 보완 5건 (고정 시간 발행·이름/사진 규칙·70:20:10 기록·engage↔§2.5 배선·신뢰 선언 캐비앳).

## 0.4.0 — 2026-08-02

- marketing-auto: 쓰레드 게시 운영 레이어 `threads-ops.md` 신설 — 『THE THREADS STRATEGY 2026』(빌리쌤)을 실측 우선 원칙으로 이식(채택/검증 대기/기각 분리, 저자 계정 4.2만 실측 확인 각주). collect 찐팬 장부(fans.md), report 재활용 후보·가설 검증 항목, research 훅 부품 후보·금지 시작어·단락 공백.
