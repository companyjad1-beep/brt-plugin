---
description: 캐릭터 시트 생성·개정 (프롬프트 생성 없음)
argument-hint: "description=<신규 시 필수> base=<개정 시 필수, 기존 시트 경로> [refs=<경로...>]"
---

# /brtimg:character

## 입력 인자

- `description`: 신규 생성 시 필수. 인물 설명 텍스트.
- `base`: 개정 시 필수. 기존 캐릭터 시트 경로.
- `refs[]`: 선택. 참고 이미지 경로 목록.
- `mode`: 선택. `guided`면 `core/prompts/appearance-catalog.md`의 4라운드 프리셋 선택으로 진행한다.
- `turnaround`: 선택 boolean. `true`면 시트 저장 후 `core/prompts/turnaround-sheet.md`의 생성기별 템플릿으로 턴어라운드 그리드 생성 프롬프트(gpt-image-2·nano-banana-pro 2종)를 함께 제공한다.

## 참조할 core 문서

- `core/prompts/character-sheet.md`
- `core/prompts/appearance-catalog.md`
- `core/prompts/turnaround-sheet.md`
- `core/prompts/series-injection.md`
- `core/prompts/persona-marketing.md`
- `core/prompts/modes.md`
- `core/schema/character-sheet.schema.json`
- `core/schema/storage-conventions.md`

## 실행 경계

시트 필드 작성, 개정, 실존 인물 처리, 저장 규약은 위 `core/` 문서를 읽어 따른다. 이 커맨드는 절차를 재정의하지 않으며, 장면 프롬프트를 생성하지 않는다.

`holdout-eval/`에는 접근하지 않는다. 모든 상대 경로는 저장소 루트 기준이다.

저장 후 `node core/tools/validate.mjs <저장경로> --schema character-sheet`를 실행한다. 실행할 수 없으면 `core/schema/storage-conventions.md`의 수동 감사로 대체한다.

## 실패 처리

필수 입력 또는 판단 정보가 부족하면 실패로 단정하지 말고 `conversational`로 전환해 필요한 정보만 요청한다.

## 출력 계약

- `workspace/characters/` 저장 경로
- 캐릭터 고정 블록 미리보기
- 가정 및 재정의 내역
- 검증 결과 또는 수동 감사 결과
