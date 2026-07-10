---
description: 축 선택(guided)으로 샷 스펙을 수집해 프롬프트 작성
argument-hint: "[idea=<선택, 시작 콘셉트>] [media=image|video] [characterSheet=<경로>] [refs=<경로...>] [generator=<선택>]"
---

# /brtimg:build

## 입력 인자

- `idea`: 선택. 시작 콘셉트. 없으면 라운드 1 전에 피사체·용도를 먼저 묻는다.
- `media`: 선택. `image`(기본) 또는 `video`.
- `characterSheet`: 선택. 인물 컷이면 권장. 없고 인물 컷이면 `appearance-catalog.md`로 시트를 먼저 만들지 1회 제안한다.
- `refs[]`: 선택. 참고 자료 경로 목록.
- `generator`: 선택.

## 참조할 core 문서

- `core/prompts/shot-spec.md`
- `core/prompts/character-sheet.md`
- `core/prompts/appearance-catalog.md`
- `core/prompts/series-injection.md`
- `core/prompts/modes.md`
- `core/prompts/loop.md`
- `core/prompts/design-memo.md`
- `core/style-library/cinematography-glossary.md`
- `core/generators/gpt-image-2.md`
- `core/generators/nano-banana-pro.md`
- `core/generators/seedance-2.md`
- `core/checklists/image.checklist.yaml`
- `core/checklists/video.checklist.yaml`
- `core/schema/storage-conventions.md`

## 실행 경계

guided 라운드 진행, 축 카탈로그, 패스 규칙, 충돌 점검, 브리프 형식은 `core/prompts/shot-spec.md`를 따른다. 브리프 확정 후에는 `oneshot`과 동일하게 루프를 완주하고 저장한다(`modes`에는 `oneshot` 기록). 이 커맨드는 절차를 재정의하지 않는다.

`holdout-eval/`에는 접근하지 않는다. 모든 상대 경로는 저장소 루트 기준이다.

저장 후 `node core/tools/validate.mjs <저장경로>`를 실행한다. 실행할 수 없으면 `core/schema/storage-conventions.md`의 수동 감사로 대체한다.

## 실패 처리

사용자가 라운드 중 이탈하거나 전부 패스하면 실패로 단정하지 말고, 현재까지의 브리프로 확인 후 진행한다.

## 출력 계약

- 샷 스펙 브리프(확정본)
- 최종 프롬프트
- 설계메모 요약
- 변형 2종
- `workspace/` 저장 경로
- 검증 결과 또는 수동 감사 결과
