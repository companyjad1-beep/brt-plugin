---
description: 프롬프트 자가채점 및 실생성 평가
argument-hint: "target=<평가 대상 프롬프트 파일 경로> [realgen=<true|false>]"
---

# /brtimg:eval

## 입력 인자

- `target`: 필수. 평가 대상 프롬프트 파일 경로.
- `realgen`: 선택 boolean. 실생성 루프 진행 여부.

## 참조할 core 문서

- `core/eval/self-score.md`
- `core/eval/realgen-loop.md`
- `core/prompts/loop.md`
- `core/prompts/design-memo.md`
- `core/checklists/image.checklist.yaml`
- `core/checklists/video.checklist.yaml`
- `core/schema/storage-conventions.md`

## 실행 경계

평가, 실생성 루프, 설계메모, 체크리스트, 저장 규약은 위 `core/` 문서를 읽어 따른다. 이 커맨드는 절차를 재정의하지 않는다.

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
