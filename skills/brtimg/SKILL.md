---
name: brtimg
description: Thin Claude Code adapter for the brtimg prompt harness.
---

# brtimg

## 목적

`brtimg`는 저장소의 `core/` 프롬프트 하네스를 Claude Code에서 호출하기 위한 얇은 어댑터다. 이 스킬은 진입점, 입력 매핑, 출력 포맷 변환만 담당한다. 모드, 루프, 설계메모, 시리즈, 평가, 저장 규약, 생성기 변환, 체크리스트 판정 규칙은 해당 `core/` 문서를 읽어 따른다.

## 커맨드

- `/brtimg:new`: 새 이미지·영상 프롬프트를 만든다.
- `/brtimg:refine`: 기존 프롬프트 파일 또는 붙여넣은 프롬프트를 개선한다.
- `/brtimg:series`: 캐릭터 시트와 장면 목록을 바탕으로 컷별 프롬프트를 만든다.
- `/brtimg:build`: 구도·카메라·조명 등 축을 라운드별로 선택(패스 가능)해 샷 스펙 브리프를 만들고 프롬프트를 작성한다.
- `/brtimg:character`: 캐릭터 시트만 생성하거나 개정한다. 프롬프트는 만들지 않는다.
- `/brtimg:eval`: 대상 프롬프트 파일을 평가한다.

## 입력 계약

### `/brtimg:new`, `/brtimg:refine`

- `idea`: 필수. `new`에서는 만들려는 아이디어이며, `refine`에서는 대상 파일 경로 또는 붙여넣은 프롬프트도 `idea`로 전달한다.
- `refs[]`: 선택. 참고 자료 경로 목록.
- `generator`: 선택.
- `mode`: 선택.

### `/brtimg:series`

- `idea`: 필수. 시리즈의 목적과 공통 콘셉트.
- `refs[]`: 선택. 참고 자료 경로 목록.
- `generator`: 선택.
- `mode`: 선택.
- `characterSheet`: 필수. 경로 또는 `생성 요청`.
- `scenes[]`: 필수. 장면 목록.

### `/brtimg:character`

- `description`: 신규 생성 시 필수. 인물 설명 텍스트.
- `base`: 개정 시 필수. 기존 캐릭터 시트 경로.
- `refs[]`: 선택. 참고 이미지 경로 목록.
- `mode`: 선택. `guided`면 `appearance-catalog.md` 프리셋 선택으로 진행.

### `/brtimg:build`

- `idea`: 선택. 시작 콘셉트.
- `media`: 선택. `image`(기본) 또는 `video`.
- `characterSheet`: 선택. 인물 컷이면 권장.
- `refs[]`: 선택. 참고 자료 경로 목록.
- `generator`: 선택.

### `/brtimg:eval`

- `target`: 필수. 평가 대상 프롬프트 파일 경로.
- `realgen`: 선택 boolean. 실생성 루프 진행 여부.

## 출력 계약

`character`를 제외한 모든 커맨드는 최종 응답에 아래 항목을 포함한다.

- 최종 프롬프트
- 설계메모 요약
- 변형 2종
- `workspace/` 저장 경로
- 검증 결과 또는 수동 감사 결과

`/brtimg:character`는 프롬프트를 생성하지 않으므로 위 계약 대신 저장 경로, 캐릭터 고정 블록 미리보기, 가정 및 재정의 내역, 검증 결과 또는 수동 감사 결과를 포함한다(`core/prompts/character-sheet.md` 출력 계약).

## 공통 규칙

- **플러그인 환경 경로 규칙**: `core/...` 상대 경로는 전부 이 스킬 폴더 기준(`${CLAUDE_PLUGIN_ROOT}/skills/brtimg/core/...`)으로 해석한다. 산출물 `workspace/...`는 호스트 프로젝트 루트 기준이다.
- `holdout-eval/`에는 접근하지 않는다.
- 입력이 부족하면 실패로 단정하지 말고 `conversational`로 전환해 필요한 정보만 요청한다.
- 산출물 저장 규약과 수동 감사는 `core/schema/storage-conventions.md`를 읽어 따른다.
- 충실도가 중요한 요청(리슛·인물 화보·이미지→프롬프트 역분석)은 `core/prompts/deep-decomposition.md`의 fidelity anchors·역분석 프로토콜(INVENTORY→FILL→READ-BACK)·교차필드 정합을 적용하고, 필드 구조는 `core/schema/image-prompt-template.json`을 참조한다.
- 저장 후 `node core/tools/validate.mjs <저장경로>`를 실행해 결과를 출력 계약에 포함한다.
- 검증 실행이 불가능하면 수동 감사 결과와 대체 사유를 출력 계약에 포함한다.
