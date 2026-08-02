# BRT Plugin Changelog

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
