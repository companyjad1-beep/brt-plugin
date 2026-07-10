---
description: 기존 프롬프트 비평 및 개선
argument-hint: "idea=<대상 파일 경로 또는 붙여넣은 프롬프트> [refs=<경로...>] [generator=<선택>] [mode=<선택>]"
---

# /brtimg:refine

## 입력 인자

- `idea`: 필수. 대상 파일 경로 또는 붙여넣은 프롬프트.
- `refs[]`: 선택. 참고 자료 경로 목록.
- `generator`: 선택.
- `mode`: 선택.

## 참조할 core 문서

- `core/prompts/modes.md`
- `core/prompts/loop.md`
- `core/prompts/deep-decomposition.md`
- `core/prompts/design-memo.md`
- `core/generators/gpt-image-2.md`
- `core/generators/nano-banana-pro.md`
- `core/generators/seedance-2.md`
- `core/checklists/image.checklist.yaml`
- `core/checklists/video.checklist.yaml`
- `core/schema/image-prompt-template.json`
- `core/schema/storage-conventions.md`

## 실행 경계

모드, 루프, 설계메모, 생성기 변환, 체크리스트, 저장 규약은 위 `core/` 문서를 읽어 따른다. 이 커맨드는 절차를 재정의하지 않는다.

`holdout-eval/`에는 접근하지 않는다. 모든 상대 경로는 저장소 루트 기준이다.

저장 후 `node core/tools/validate.mjs <저장경로>`를 실행한다. 실행할 수 없으면 `core/schema/storage-conventions.md`의 수동 감사로 대체한다.

## 실패 처리

필수 입력 또는 판단 정보가 부족하면 실패로 단정하지 말고 `conversational`로 전환해 필요한 정보만 요청한다.

## 출력 계약

- 최종 프롬프트
- 설계메모 요약
- 변형 2종
- `workspace/` 저장 경로
- 검증 결과 또는 수동 감사 결과
