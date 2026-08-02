# Marketing Auto Fresh Topic Production Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 일반적인 글 생산 요청마다 새 외부 반응 신호로 채널 공용 주제팩을 만들고, 과거·동일 run과 의미가 다른 주제를 쓰레드 기본 또는 명시한 채널에서 제작하게 한다.

**Architecture:** `marketing-auto` 내부에 기본 `write`, 명시적 `batch`, 명시적 `recycle` 라우팅을 둔다. `research.md`가 채널 공용 신규 발견·의미 중복·주제팩을 책임지고, `SKILL.md`는 주제팩의 채널별 파생·작가 격리·검수·장부 기록을 조율하며, `brtwritenotai`는 현재 주제의 사실만 받아 채널별 문장을 만든다.

**Tech Stack:** Markdown 기반 Claude/Codex 스킬, Git, `rg`, fresh-agent pressure tests

## Global Constraints

- 신규 발견·의미 서명·사실팩은 채널 공용이다. 채널 생략 시 기본 출력은 쓰레드이고, 블로그·인스타그램은 명시적 채널 요청 또는 기존 주제팩 파생 요청에서만 제작한다.
- 같은 주제팩의 명시적 타 채널 파생은 허용하지만, 본문·훅·골격·길이·말투는 채널별 최신 레퍼런스로 다시 만든다. 파생 지시 없는 신규 write에서는 다른 채널에서 사용한 같은 의미 서명도 중복이다.
- 생산 경계는 날짜가 아니라 사용자 생산 요청 1회인 `run`이다.
- `skills/marketing-auto/threads-ops.md`와 『THE THREADS STRATEGY 2026』 이식 판정은 변경하지 않는다.
- 기존 작업트리의 `VERSION`, `CHANGELOG.md`, 버전 표기, 인스타 카드뉴스, GA4/UTM, `skills/brtwritenotai/core/threads-ops.md` 미러 변경을 보존한다.
- 게시·댓글·팔로우는 계속 사용자가 실행한다.
- `[덩어리×각도]`는 분류·집계용이고, `독자 문제 | 핵심 주장 | 사례·근거 | 결론` 의미 서명이 신규 여부의 유일한 게이트다.
- 새 글 생산에서는 과거 주제·사실·수치·사례·문장을 재사용하지 않는다. 성과 학습은 훅 구조·형태·길이·전개·종결·CTA·골격에만 적용한다.
- 땔감은 report 추천과 사용자 명시 요청이 모두 있을 때만 `recycle`로 실행한다.
- 원본 저장소가 SOT다. 설치 캐시 `C:/Users/User/.codex/plugins/cache/...`는 직접 수정하지 않는다.

---

### Task 1: 기본 write 라우팅과 모드 계약

**Files:**
- Modify: `commands/marketing-auto.md:1-16`
- Modify: `skills/marketing-auto/SKILL.md:1-27`

**Interfaces:**
- Consumes: 사용자 인자 첫 토큰과 일반 자연어 생산 요청
- Produces: `write | batch | recycle | collect | report | engage | publish` 모드, `run` 편수, 선택적 주제 미리보기 플래그

- [ ] **Step 1: 현재 라우팅 실패를 고정한다**

Run:

```bash
rg -n '생략 시 batch|그 외/생략 → \*\*batch 모드\*\*|\*\*batch\*\* \(기본\)' commands/marketing-auto.md skills/marketing-auto/SKILL.md
```

Expected: 현재 기본값이 `batch`인 문장이 검색되어 신규 write 요구에 실패한다.

- [ ] **Step 2: 명령 라우터를 write 기본값으로 바꾼다**

`commands/marketing-auto.md`의 frontmatter와 라우팅을 다음 계약으로 수정한다.

```markdown
description: "마케팅 자동화 하네스 — 쓰레드 신규 리서치→의미 중복 차단→편별 생산(write), 명시적 배치 계획(batch), 성과 수집·분석"
argument-hint: "[write|batch|recycle|collect|report|engage] [편수·주제·지시] · 일반 글 요청/생략 시 write"

- `write` → 토큰을 소비하고 나머지 인자를 신규 생산 지시로 쓴다.
- `batch` → 토큰을 소비하고 기존 승인형 배치 생산을 실행한다.
- `recycle` → 토큰을 소비하고 report가 지목한 기존 글의 명시적 재활용만 실행한다.
- 그 외/생략 → **write 모드**. 일반적인 "새 글", "쓰레드 글 N개" 요청을 신규 생산 지시로 사용한다.
```

모드에 필요한 문서만 로드하되 `write`와 `batch`는 시작 전에 `SKILL.md`와 `research.md`를 다시 읽게 한다.

- [ ] **Step 3: SKILL 모드 표와 책임을 일치시킨다**

`skills/marketing-auto/SKILL.md` 모드 표에 다음 행을 반영한다.

```markdown
| **write** (기본) | 쓰레드 신규 수집 → 의미 중복 차단 → 편별 사실팩 → 자동 생산. 요청 1회가 run이며 날짜 경계 없음 | 이 문서 + research.md + threads-ops.md |
| **batch** (명시 요청) | 주제 선정 → 배치표 승인 → 훅 승인 → 채널별 생산 | 이 문서 + research.md + threads-ops.md |
| **recycle** (명시 요청) | report가 추천한 땔감 1편을 새 첫 줄·종결·형태로 재발행 준비 | 이 문서 + report.md + threads-ops.md |
```

`collect`, `report`, `engage`, `publish` 행은 기존 책임을 유지한다. `write`는 `brtwritenotai write`와 다른 `marketing-auto` 내부 오케스트레이션 이름이라고 명시한다.

- [ ] **Step 4: 라우팅 계약을 정적 검증한다**

Run:

```bash
rg -n '일반 글 요청/생략 시 write|그 외/생략 → \*\*write 모드\*\*|\*\*write\*\* \(기본\)|\*\*batch\*\* \(명시 요청\)|\*\*recycle\*\* \(명시 요청\)' commands/marketing-auto.md skills/marketing-auto/SKILL.md
```

Expected: 다섯 계약이 모두 검색되고 `생략 시 batch`는 0건이다.

- [ ] **Step 5: Task 1 변경만 커밋한다**

```bash
git add commands/marketing-auto.md skills/marketing-auto/SKILL.md
git diff --cached --check
git commit -m "marketing-auto: 신규 write를 기본 생산 모드로 전환"
```

---

### Task 2: run별 신규 리서치와 의미 중복 게이트

**Files:**
- Modify: `skills/marketing-auto/research.md:1-68`
- Modify: `skills/marketing-auto/SKILL.md:27-160`

**Interfaces:**
- Consumes: `run_id`, 요청 편수, 선택적 사용자 지정 주제, `playbook.md`, `ledger.md`, `topics.md`, 이번 run 외부 수집 결과
- Produces: `selected_signatures`, 편별 `fact_pack`, 신규 후보 또는 검증된 미달 보고

- [ ] **Step 1: 현재 백로그 우선·분류 단위 중복 실패를 고정한다**

Run:

```bash
rg -n '백로그에서 먼저 꺼낸다|중복 체크는 \*\*\[덩어리×각도\] 단위|batch 3단계는 백로그에서 꺼내' skills/marketing-auto/SKILL.md skills/marketing-auto/research.md
```

Expected: 백로그 우선과 `[덩어리×각도]` 중복 판정 문장이 검색되어 제품명·금액만 바꾼 동일 주장 차단에 실패한다.

- [ ] **Step 2: research.md에 write 신규 발견 절차를 추가한다**

문서 앞부분에 `## §0 write — run별 신규 발견`을 추가하고 다음 순서를 고정한다.

```markdown
1. run 시작 뒤에 최근 반응 글·실질문·검색 수요·시의 사건을 새로 수집한다. topics.md를 후보 큐로 먼저 열지 않는다.
2. 계정 포지셔닝 밖 후보를 제외한다.
3. 수요·증명·우리 재료로 삼각측량한다. 시의 각도의 기존 증명 면제는 유지한다.
4. 각 후보에 `독자 문제 | 핵심 주장 | 사례·근거 | 결론` 의미 서명을 만든다.
5. ledger의 완성 초안·게시 글과 `selected_signatures`를 함께 대조한다.
6. 통과 후보가 편수보다 적으면 검색 토큰·출처·기간을 넓힌다. 과거 후보로 수량을 채우지 않는다.
7. 오래된 미사용 후보는 이번 run에서 새로 수집한 외부 신호로 재검증된 경우에만 보강 재료로 쓴다.
```

편수 미지정은 1편, `N개`는 한 번 수집한 후보 풀에서 의미가 다른 N개를 고르되 편별 사실 검증을 따로 수행한다고 명시한다.

- [ ] **Step 3: 분류와 중복 판정 책임을 분리한다**

`research.md`에 다음 판정 규칙을 추가한다.

```markdown
- `[덩어리×각도]`는 집계·매트릭스·성과 분석용 분류다.
- 의미 서명은 write 신규 여부를 결정하는 유일한 게이트다.
- 제품이 달라도 핵심 주장과 결론이 같으면 중복이다.
- 같은 사례에서 같은 교훈을 내면 문장을 바꿔도 중복이다.
- 같은 제품이어도 독자 문제와 핵심 주장이 실질적으로 다르면 통과할 수 있다.
- 같은 run 안에서는 후보를 고르는 즉시 `selected_signatures`에 넣어 다음 후보와 대조한다.
```

예시로 `아이폰 15·6만원 인상`과 `아이폰 16·3만원 인상`은 기각, `가격 인상`과 `개인정보 노출`은 조건 충족 시 별도 주제로 명시한다.

- [ ] **Step 4: topics.md를 기억·증거 저장소로 재정의한다**

`research.md`의 백로그 설명을 모드별로 분리한다.

```markdown
- write: 미사용 후보·출처·마지막 검증일·사용 상태·댓글 수요를 대조·보강에만 사용한다.
- batch: 기존 승인형 기획의 백로그 사용을 유지하되 write의 신규 여부를 대신하지 않는다.
- 오래된 후보는 이번 run 외부 신호와 겹치지 않으면 write 생산 후보가 아니다.
```

기존 합산·건수·중앙값, 아웃라이어, 시의 각도, 골격 근거 규칙은 삭제하지 않는다.

- [ ] **Step 5: SKILL.md에 write 12단계 흐름을 추가한다**

모드 표 다음에 아래 단계가 모두 보이게 쓴다.

```markdown
1 run 시작
2 신규 발견 리서치
3 포지셔닝 필터
4 삼각측량
5 의미 중복 게이트
6 후보 확장
7 편별 사실팩
8 자동 훅 선택
9 봉인된 작가 생산
10 목적·AI 티·중복·잔존 검수
11 ledger 기록
12 본문·선택 훅 근거·대안 훅 2개·출처·중복 결과 출력
```

`주제부터 보여줘`를 명시한 경우에만 후보표에서 멈추고, 일반 write는 승인 없이 끝까지 진행한다.

- [ ] **Step 6: 사실팩과 장부 계약을 명시한다**

편별 fact pack 필드를 다음처럼 고정한다.

```markdown
현재 주제 | 독자 | 의미 서명 | 목적·CTA | 현재 출처(URL·수집일·반응 수치) | 사용할 사실·수치 | 우리 재료 | 골격·형태·치수 | 금지할 이전 고유명사·숫자·사례
```

ledger 표에 `의미서명`과 `리서치근거` 칼럼을 추가하고, 게시 URL이 없는 완성 초안도 다음 run의 중복 대조 대상이라고 명시한다.

- [ ] **Step 7: 신규 발견 계약을 정적 검증한다**

Run:

```bash
rg -n 'run별 신규 발견|selected_signatures|독자 문제.*핵심 주장.*사례·근거.*결론|아이폰 15.*아이폰 16|주제부터 보여줘|금지할 이전 고유명사|의미서명.*리서치근거' skills/marketing-auto/research.md skills/marketing-auto/SKILL.md
```

Expected: 모든 계약이 검색된다. 기존 `합산 · 건수 · 중앙값`, `아웃라이어 주의`, `시의 각도`도 각각 1건 이상 남는다.

- [ ] **Step 8: Task 2 변경만 커밋한다**

```bash
git add skills/marketing-auto/research.md skills/marketing-auto/SKILL.md
git diff --cached --check
git commit -m "marketing-auto: run별 신규 리서치와 의미 중복 게이트 추가"
```

---

### Task 3: 작가 컨텍스트 격리와 재작성 오염 차단

**Files:**
- Modify: `skills/marketing-auto/SKILL.md:108-128`
- Modify: `skills/brtwritenotai/core/pipeline.md:15-32`
- Modify: `skills/brtwritenotai/core/eval.md:21-24`

**Interfaces:**
- Consumes: Task 2의 편별 `fact_pack`, 이전 편의 폐기 고유명사·숫자 목록, 변경 요청 종류
- Produces: 새 생산 또는 polish 라우팅, 현재 주제만 포함한 원고, 잔존 검사 결과

- [ ] **Step 1: 현재 재진입·주제 일치 규칙 부재를 확인한다**

Run:

```bash
rg -n '이전 초안·직전 편 본문은|주제·제품·예시·사실이 바뀌|현재 주제의 것만 인정|write 모드 재실행' skills/marketing-auto/SKILL.md skills/brtwritenotai/core/pipeline.md skills/brtwritenotai/core/eval.md
```

Expected: 네 문구가 없어서 재작성 시 이전 제품 사실이 재사용될 수 있다.

- [ ] **Step 2: 작가 핸드오프 번들을 봉인한다**

기존 `작가에게 넘기는 것` 끝에 다음 규칙을 붙인다.

```markdown
이전 초안·직전 편 본문은 번들에 절대 포함하지 않는다. 작가는 전체 ledger·batches·topics·이전 본문을 검색하지 않고, 편별 fact pack과 추출된 골격만 읽는다. "참고용" 이전 본문도 오류 패턴과 사실을 오염시키므로 금지한다.
```

write는 편마다 새 작가 컨텍스트를 사용하고, 서브에이전트를 못 띄우면 편 사이에 fact pack을 다시 읽어 컨텍스트를 리셋한다.

- [ ] **Step 3: 재작성 게이트를 추가한다**

`작가에게 넘기는 것`과 훅 규칙 사이에 다음 계약을 삽입한다.

```markdown
주제·제품·예시·사실이 바뀌는 재작성은 수정이 아니라 새 편 생산이다. 새 작가 컨텍스트와 새 fact pack을 만들고, 목적·CTA·승인된 골격·말투만 유지한다. 이전 편의 사실·수치·사례·문장은 모두 무효다. 현재 주제 재료가 없으면 질문하거나 후보를 교체하며 이전 초안으로 빈칸을 채우지 않는다. 말투·길이·표현만 바뀌고 사실이 그대로일 때만 인라인 polish를 허용한다.
```

- [ ] **Step 4: write와 batch의 훅·재료 분기를 분명히 한다**

기존 단일 게이트를 다음처럼 분리한다.

```markdown
- write: 우리 채널 성과 → 이번 수집 상위 글 → 활성·승격 골격 순으로 훅을 자동 선택하고 대안 2개를 출력한다.
- batch: 기존 훅 후보 2~3개 사용자 선택 게이트를 유지한다.
- 주제 미지정 write의 재료 부족: 후보를 탈락시키고 다음 후보로 교체한다.
- 사용자 지정 write의 재료 부족: 주제를 바꾸지 않고 사용자에게 묻는다.
- batch의 재료 부족: 기존 장면 재료 질문을 유지한다.
- 전 후보 탈락: 부족을 보고하고 과거 사실로 편수를 채우지 않는다.
```

- [ ] **Step 5: 목적 게이트에 기계적 잔존 검사를 추가한다**

`살아있는 한 줄 검사` 앞에 다음 항목을 넣는다.

```markdown
- 잔존 검사 (재작성 편만): 폐기된 이전 주제의 제품명·수치·사례·문장이 남아 있으면 기각한다. 이전 편의 고유명사·숫자 목록을 뽑아 새 본문에서 기계적으로 검색하며 느낌으로 판정하지 않는다.
```

잔존 시 새 컨텍스트로 1회 재생산하고, 다시 실패하면 해당 편을 폐기한다고 쓴다.

- [ ] **Step 6: brtwritenotai 슬롯을 현재 주제에 묶는다**

`pipeline.md` Phase 1 슬롯 3 끝에 다음 문장을 추가한다.

```markdown
실측 디테일은 현재 주제의 것만 인정한다. 직전 초안·다른 제품·이전 주제의 수치가 컨텍스트에 있어도 슬롯을 채운 것으로 치지 않는다. 주제·제품이 바뀌면 슬롯 3을 비우고 인터뷰 또는 현재 fact pack으로 다시 채운다.
```

- [ ] **Step 7: polish 의미 불변 경계를 명시한다**

`eval.md` polish 문단 끝에 다음 문장을 추가한다.

```markdown
주제·제품·사실을 바꾸는 요청은 의미 불변 가드와 충돌하므로 polish 범위 밖이다. 받으면 기존 원고를 고치지 말고 write 모드 새 생산으로 넘긴다고 답한다.
```

- [ ] **Step 8: 오염 차단 계약을 정적 검증한다**

Run:

```bash
rg -n '이전 초안·직전 편 본문은 번들에 절대 포함하지 않는다|주제·제품·예시·사실이 바뀌는 재작성|잔존 검사 \(재작성 편만\)|현재 주제의 것만 인정|polish 범위 밖' skills/marketing-auto/SKILL.md skills/brtwritenotai/core/pipeline.md skills/brtwritenotai/core/eval.md
```

Expected: 다섯 방어선이 모두 검색된다.

- [ ] **Step 9: Task 3 변경만 커밋한다**

```bash
git add skills/marketing-auto/SKILL.md skills/brtwritenotai/core/pipeline.md skills/brtwritenotai/core/eval.md
git diff --cached --check
git commit -m "marketing-auto: 재작성 사실 오염과 polish 오라우팅 차단"
```

---

### Task 4: 성과 학습·신호 적립·땔감 경계

**Files:**
- Modify: `skills/marketing-auto/report.md:1-30`
- Modify: `skills/marketing-auto/collect.md:26-38`

**Interfaces:**
- Consumes: ledger 성과, comments.md 실질문, fans.md 반복 질문, 오래된 상위 성과 글
- Produces: 다음 write의 형식 권고·탐색 토큰, 신규 리서치 수요 신호, 명시적 recycle 후보

- [ ] **Step 1: report의 주제 재생산 위험을 확인한다**

Run:

```bash
rg -n '다음 배치 권고.*주제 방향|다음 batch 우선 재사용|재활용\(땔감\) 후보' skills/marketing-auto/report.md
```

Expected: 성과 권고가 주제 재생산 지시로 읽힐 수 있고 땔감의 실행 경계가 없다.

- [ ] **Step 2: report 학습 범위를 형식으로 제한한다**

출력 계약을 다음처럼 교정한다.

```markdown
- 다음 write 권고: 성과가 좋았던 훅 구조·형태·길이·전개·종결·CTA·골격을 기록한다.
- 주제 방향은 다음 write의 검색 토큰으로만 제안한다. 특정 과거 주제·제품·사례를 자동 재생산하라고 지시하지 않는다.
- batch 권고는 기존 승인형 계획에만 적용한다.
```

골격 승격/도태는 유지하되 골격 우선 재사용이 주제·사실 재사용 허가가 아니라고 명시한다.

- [ ] **Step 3: 땔감을 명시적 recycle 예외로 고정한다**

재활용 후보 항목에 다음 조건을 추가한다.

```markdown
땔감 추천은 신규 write 후보가 아니다. report가 후보를 지목하고 사용자가 해당 글 재활용을 명시했을 때만 recycle로 실행한다. 3~6개월·핵심 메시지 유지·첫 줄/종결/형태 변주를 따르며 가격·정책·시세 등 변동 사실은 재검증한다.
```

- [ ] **Step 4: collect 신호가 신규 발견에 연결되게 한다**

댓글 사연과 찐팬 장부 설명에 다음을 추가한다.

```markdown
댓글·반복 질문은 다음 write의 수요 신호로 적립하지만 자동 주제 확정은 아니다. 다음 run의 외부 신규 수집과 겹치는지 재검증한 뒤 삼각측량에 사용한다.
```

기존 티스토리와 GA4/UTM 문장은 그대로 보존한다.

- [ ] **Step 5: 피드백 경계를 정적 검증한다**

Run:

```bash
rg -n '검색 토큰으로만|주제·사실 재사용 허가가 아니다|신규 write 후보가 아니다|다음 run의 외부 신규 수집' skills/marketing-auto/report.md skills/marketing-auto/collect.md
rg -n '티스토리|GA4|utm_source=threads/naverblog/tistory' skills/marketing-auto/collect.md
```

Expected: 신규 경계 네 개와 기존 사용자 변경 세 개가 모두 검색된다.

- [ ] **Step 6: Task 4 변경만 커밋한다**

```bash
git add skills/marketing-auto/report.md skills/marketing-auto/collect.md
git diff --cached --check
git commit -m "marketing-auto: 성과 형식 학습과 명시적 재활용 경계 분리"
```

---

### Task 5: 공용 주제팩과 채널별 파생 제작

**Files:**
- Modify: `commands/marketing-auto.md`
- Modify: `skills/marketing-auto/SKILL.md`
- Modify: `skills/marketing-auto/research.md`

**Interfaces:**
- Consumes: 신규 리서치 통과 후보 또는 기존 `topic_pack_id`, 요청 채널, 채널별 최신 레퍼런스
- Produces: `docs/marketing/topic-packs/<topic_pack_id>.md`, 채널별 별도 산출물, ledger의 주제팩·파생 관계

- [ ] **Step 1: 현재 채널 공용 주제팩 계약 부재를 확인한다**

Run:

```bash
rg -n 'topic_pack_id|주제팩 파생 제작|채널을 생략하면 쓰레드|사용 채널' skills/marketing-auto/SKILL.md skills/marketing-auto/research.md
```

Expected: 공용 주제팩·명시적 채널 파생 계약이 없어 검색 결과가 불완전하다.

- [ ] **Step 2: 주제팩 저장 계약을 추가한다**

`research.md`의 write 신규 발견 결과를 `docs/marketing/topic-packs/<topic_pack_id>.md`에 저장하게 하고 필드를 고정한다.

```markdown
topic_pack_id | 의미 서명 | 수요 근거 | 증명 근거 | 사실·출처·수집일 | 우리 재료 | 변동 사실 | 사용 채널
```

신규 write는 ledger와 모든 주제팩의 의미 서명을 대조한다. 주제팩을 저장해도 `topics.md`는 계속 증거·중복 기억이며 자동 후보 큐가 아니다.

- [ ] **Step 3: 기본 쓰레드와 명시적 채널 파생을 분리한다**

`commands/marketing-auto.md`의 설명을 채널 공용 신규 리서치로 교정하고, `SKILL.md`에 다음 계약을 추가한다.

```markdown
- 채널을 생략한 일반 새 글 요청은 쓰레드로 제작한다.
- 채널을 명시한 신규 write는 같은 공용 주제 리서치 뒤 해당 채널 파이프라인으로 보낸다.
- "이 주제로 인스타 카드뉴스도", "이 주제로 블로그도"처럼 기존 주제 활용을 명시하면 신규 주제 선정이 아니라 주제팩 파생 제작이다.
- 파생 제작은 같은 의미 서명을 허용하되 동일 topic_pack_id를 유지하고 사용 채널을 추가한다.
- 가격·정책·시세·제품 사양 같은 변동 사실은 파생 시점에 다시 검증한다.
- 각 채널의 최신 상위 글·골격·훅은 제작 시점에 새로 수집한다.
- 공유하는 것은 사실·출처·우리 재료뿐이며 이전 채널의 본문·문장·훅은 작가 번들에 넣지 않는다.
- 같은 주제팩을 같은 채널에서 다시 만드는 것은 신규 write가 아니라 명시적 recycle 또는 사실 변경 재작성이다.
- threads-ops.md는 쓰레드 제작에만 적용한다.
```

- [ ] **Step 4: ledger에 주제팩 관계를 기록한다**

기존 ledger 계약에 `topic_pack_id`와 `파생` 칼럼을 추가한다. `파생`은 `원본` 또는 `<기존 채널>→<새 채널>`로 기록한다. 새 채널 파생은 신규 의미 서명을 만들지 않는다.

- [ ] **Step 5: 주제팩·파생 계약을 정적 검증한다**

Run:

```bash
rg -n '채널 공용 신규 리서치' commands/marketing-auto.md
rg -n 'docs/marketing/topic-packs/<topic_pack_id>\.md|topic_pack_id.*의미 서명.*수요 근거.*증명 근거.*사용 채널|채널을 생략한 일반 새 글 요청은 쓰레드|주제팩 파생 제작|동일 topic_pack_id|이전 채널의 본문·문장·훅|threads-ops\.md는 쓰레드' skills/marketing-auto/SKILL.md skills/marketing-auto/research.md
rg -n 'topic_pack_id.*파생|원본.*기존 채널.*새 채널' skills/marketing-auto/SKILL.md
```

Expected: 저장·기본 채널·명시 파생·동일 ID·본문 격리·쓰레드 규칙 범위·ledger 관계가 모두 검색된다.

- [ ] **Step 6: Task 5 변경만 커밋한다**

```bash
git add commands/marketing-auto.md skills/marketing-auto/SKILL.md skills/marketing-auto/research.md
git diff --cached --check
git commit -m "marketing-auto: 공용 주제팩과 채널별 파생 제작 추가"
```

---

### Task 6: Fresh-agent 회귀검증과 불변 파일 감사

**Files:**
- Verify: `commands/marketing-auto.md`
- Verify: `skills/marketing-auto/SKILL.md`
- Verify: `skills/marketing-auto/research.md`
- Verify: `skills/marketing-auto/report.md`
- Verify: `skills/marketing-auto/collect.md`
- Verify: `skills/brtwritenotai/core/pipeline.md`
- Verify: `skills/brtwritenotai/core/eval.md`
- Must not modify: `skills/marketing-auto/threads-ops.md`

**Interfaces:**
- Consumes: 수정된 SOT 스킬 문서와 가상 ledger/fact pack 시나리오
- Produces: 요구사항별 PASS/FAIL 근거, 동결 파일 무변경 증거, 남은 위험 목록

- [ ] **Step 1: 동결 파일 기준 해시와 작업트리 범위를 확인한다**

Run:

```bash
git rev-parse HEAD:skills/marketing-auto/threads-ops.md
git hash-object skills/marketing-auto/threads-ops.md
git status --short
```

Expected: 두 해시가 같고 `skills/marketing-auto/threads-ops.md`가 status에 나타나지 않는다. 기존 사용자 변경 파일은 그대로 남아 있어야 한다.

- [ ] **Step 2: fresh-agent 신규 주제 압박 테스트를 실행한다**

수정된 `commands/marketing-auto.md`, `SKILL.md`, `research.md`만 제공한 새 에이전트에게 아래 시나리오를 각각 독립 실행시킨다.

```text
ledger에는 "아이폰 15 가격이 6만원 올랐다 → 지금 팔아야 한다"는 완성 초안이 있다.
사용자가 "새 쓰레드 글 써보자"라고 했다.
후보 A는 "아이폰 16 가격이 3만원 올랐다 → 지금 팔아야 한다"이고,
후보 B는 "중고폰 초기화 뒤 개인정보가 남을 수 있다 → 판매 전 확인해야 한다"다.
어떤 후보를 선택하고, 어떤 근거로 탈락/통과시키며, 사용자 승인이 필요한지 답하라.
```

Expected: A는 제품이 달라도 의미 중복으로 기각, B는 새 수요·증명·재료가 있으면 통과, 일반 write는 중간 승인 없음.

- [ ] **Step 3: fresh-agent 3편 run 내부 중복 테스트를 실행한다**

```text
사용자가 "오늘 쓰레드 글 3개 써줘"라고 했다. 후보 5개의 제품명은 모두 다르지만 그중 3개가 "가격이 올랐으니 지금 팔자"라는 같은 주장이다. 생산 경계, 리서치 횟수, 편별 검증, 같은 run 중복 판정, 수량 미달 처리 순서로 답하라.
```

Expected: 날짜를 경계로 삼지 않고 요청 1회가 run, 신규 발견 수집 1회 후 편별 사실팩, 같은 의미는 1편만, 부족하면 수집 확장, 그래도 부족하면 검증된 편만 출력.

- [ ] **Step 4: fresh-agent 재작성·과차단 역검사를 실행한다**

```text
첫 요청: 아이폰 15·6만원 인상 글을 작성했다.
요청 A: "아이폰 16 예시로 다시 써줘. 3만원 인상이라고 해."
요청 B: "내용은 그대로 두고 말투만 더 담담하게 바꿔줘."
각 요청에서 새 리서치, 새 fact pack, 이전 본문 전달, polish 허용 여부를 표로 답하라.
```

Expected: A는 새 생산·새 사실팩·이전 본문 금지·잔존 검색, B만 의미 불변 polish 허용.

- [ ] **Step 5: fresh-agent 자동/명시 분기 테스트를 실행한다**

```text
네 경우를 답하라.
1) 일반 write에서 자동 선정 후보의 장면 재료가 없다.
2) 사용자가 지정한 주제의 장면 재료가 없다.
3) batch에서 훅 후보가 나왔다.
4) report가 4개월 전 성과 글을 땔감으로 추천했지만 사용자는 "새 글 써줘"만 말했다.
```

Expected: 1 후보 교체, 2 사용자 질문, 3 사용자 훅 선택, 4 신규 write에 섞지 않음.

- [ ] **Step 6: fresh-agent 채널 공용 주제팩 테스트를 실행한다**

```text
쓰레드에서 topic_pack_id TP-001의 "중고폰 초기화 뒤 개인정보 노출" 글을 이미 만들었다.
요청 A: "이 주제로 인스타 카드뉴스도 만들어줘."
요청 B: 파생 언급 없이 "새 인스타 글 만들어줘."
각 요청에서 의미 중복 판정, topic_pack_id, 사실 재검증, 채널 레퍼런스, 이전 쓰레드 본문 전달 여부를 답하라.
```

Expected: A는 명시적 파생이라 TP-001을 유지하고 변동 사실·인스타 레퍼런스를 새로 검증하며 쓰레드 본문을 전달하지 않는다. B는 신규 write라 TP-001과 같은 의미 서명을 후보에서 제외한다.

- [ ] **Step 7: PDF 이식 규칙과 기존 사용자 변경을 회귀 검사한다**

Run:

```bash
git diff --exit-code HEAD -- skills/marketing-auto/threads-ops.md
rg -n '발행|팀킬|60분|댓글 원정|팔로|땔감|IABA|저장|공유' skills/marketing-auto/threads-ops.md
rg -n '인스타 카드뉴스' skills/marketing-auto/SKILL.md
rg -n '티스토리|GA4|utm_source=threads/naverblog/tistory' skills/marketing-auto/collect.md
test -f skills/brtwritenotai/core/threads-ops.md
```

Expected: 동결 파일 diff 0, PDF 이식 핵심어 유지, 카드뉴스·티스토리·GA4/UTM·미러 유지.

- [ ] **Step 8: 전체 정적 품질 검사를 실행한다**

Run:

```bash
git diff --check
rg -n '생략 시 batch|그 외/생략 → \*\*batch 모드\*\*' commands/marketing-auto.md
rg -n '아이폰 15.*6만원|아이폰 16.*3만원' skills/marketing-auto/SKILL.md skills/marketing-auto/research.md
```

Expected: 이번 변경에서 새 공백 오류가 없고, 기본 batch 문구는 0건이며, 아이폰 예시는 규칙 설명에만 존재한다.

기존 사용자 변경에 이미 있던 공백 경고가 나오면 파일·줄을 분리 보고하고 이 작업이 만든 오류처럼 주장하지 않는다.

- [ ] **Step 9: 검증 결과를 요약하고 필요할 때만 보정 커밋한다**

보정이 필요하면 관련 파일만 stage한 뒤 다음 형식을 사용한다.

```bash
git add commands/marketing-auto.md skills/marketing-auto/SKILL.md skills/marketing-auto/research.md skills/marketing-auto/report.md skills/marketing-auto/collect.md skills/brtwritenotai/core/pipeline.md skills/brtwritenotai/core/eval.md
git diff --cached --check
git commit -m "marketing-auto: 신규 주제 생산 회귀검증 보완"
```

보정이 없으면 빈 커밋을 만들지 않는다. 최종 보고에는 fresh-agent 시나리오별 PASS/FAIL, 동결 파일 해시 일치 여부, 수정 파일 목록, 설치 캐시는 미수정 상태임을 적는다.
