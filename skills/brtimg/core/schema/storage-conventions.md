# workspace 저장 규약

## 경로 규칙

- 프롬프트 산출물: `workspace/prompts/YYYY-MM-DD-slug.yaml`
  - 예: `workspace/prompts/2026-07-07-wellness-launch.yaml`
- 캐릭터 시트: `workspace/characters/name.yaml`
  - 예: `workspace/characters/han-minseo.yaml`
- 평가 리포트: `workspace/reports/*.json`
  - 예: `workspace/reports/2026-07-07-wellness-launch-checklist.json`

## 저장 단위

- 하나의 프롬프트 파일에는 최종 텍스트(`finalText`), 설계 메모(`designMemo`), 변형안(`variants`)을 함께 저장합니다.
- 캐릭터 시트는 반복 생성에서 재사용되는 인물 고정 정보만 저장합니다.
- 평가 리포트는 체크리스트, 골든 블라인드, 실제 생성 평가 중 하나의 계층(`layer`) 결과를 파일 하나에 저장합니다.

## 재사용과 버전 규칙

- 기존 산출물을 직접 덮어쓰지 않습니다.
- 의미 있는 수정이 생기면 새 파일을 만들고, 선택 메타데이터 `supersedes`에 이전 파일 경로를 기록합니다.
- `schemaVersion`은 스키마 호환성을 나타내며, 파일 개정 번호로 사용하지 않습니다.
- 파일명 `slug`는 날짜와 목적을 드러내는 짧은 영문 소문자 케밥 표기(kebab-case)를 사용합니다.

## 캐릭터 시트 재사용 방법

- 프롬프트 파일의 `characterSheetRef`에는 재사용할 캐릭터 시트 경로를 기록합니다.
- 캐릭터 일관성에 필요한 얼굴형, 헤어, 눈, 피부, 체형, 대표 특징은 캐릭터 시트의 `appearance`와 `identityAnchors`에 둡니다.
- 프롬프트 본문에는 생성 장면에 꼭 필요한 캐릭터 앵커만 반복 기입하고, 전체 외형 정의는 캐릭터 시트를 기준으로 유지합니다.
- 캐릭터 참조 이미지는 캐릭터 시트의 `referenceImagePaths`에 모으고, 특정 프롬프트에서 추가로 필요한 제품 또는 배경 이미지만 프롬프트의 `referenceImagePaths`에 둡니다.

## YAML 사용 범위

- 기본 저장 형식은 사람이 읽기 쉬운 YAML입니다.
- `core/tools/validate.mjs`는 외부 라이브러리 없이 스칼라, 리스트, 중첩 맵, 주석을 처리하는 단순 YAML 파서를 포함합니다.
- 여러 줄 블록 문자열이 필요한 경우 검증 호환성을 위해 큰따옴표 문자열 하나로 저장하거나 JSON 파일을 사용합니다.

## 수동 감사 체크리스트 (validate.mjs 대체 경로)

Node 런타임이 없어 `core/tools/validate.mjs`를 실행할 수 없는 환경에서는 아래 수동 감사 체크리스트로 대체한다. 이 체크리스트는 validate.mjs의 필수 필드·타입 검증을 그대로 미러링하며, 자기보고("검증 통과했다"는 서술)만으로 통과 처리하는 것을 금지한다.

### prompt 파일 수동 감사
- [ ] `schemaVersion`이 정확히 `1`이다.
- [ ] `id`, `title`이 비어 있지 않은 문자열이다.
- [ ] `targetGenerator`가 `gpt-image-2` / `nano-banana-pro` / `seedance-2` 중 하나다.
- [ ] `modes`가 배열이고 각 값이 `oneshot` / `multi3` / `conversational` / `multimodal` 중 하나다.
- [ ] `finalText`가 비어 있지 않은 문자열이다.
- [ ] `designMemo`에 `interpretation`, `keyChoices`, `assumptions`(배열), `changePoints`(배열)가 있다.
- [ ] `designMemo.loopTrace`가 3개 이상의 객체 배열이고, 각 객체에 `pass`(숫자), `type`(`draft`/`critique`/`improve`), `summary`(문자열), `weaknesses`(배열), `changesApplied`(배열)가 모두 있다.
- [ ] `createdAt`이 존재한다.
- [ ] `variants`가 2개 이상 항목을 가진 배열이고, 각 항목에 `label`, `text`가 있다.
- [ ] (있다면) `checklistResults` 각 항목의 `verdict`가 `충족` / `부분 충족` / `미달` / `판정 불가` 중 하나다.

### character-sheet 파일 수동 감사
- [ ] `schemaVersion`이 정확히 `1`이다.
- [ ] `id`, `name`이 비어 있지 않은 문자열이다.
- [ ] `appearance`에 `face`, `hair`, `eyes`, `skin`, `build`, `signatureFeatures`(배열)가 있다.
- [ ] `identityAnchors`가 1개 이상 항목을 가진 배열이다.
- [ ] `referenceImagePaths`, `negativeConstraints`가 배열이다.
- [ ] `createdAt`이 존재한다.

### eval-report 파일 수동 감사
- [ ] `schemaVersion`이 정확히 `1`이고 `id`, `promptRef`, `createdAt`이 있다.
- [ ] `layer`가 `checklist` / `golden-blind` / `realgen` 중 하나이고 `verdict`가 `passed` / `failed` / `provisional` 중 하나다.
- [ ] `layer=checklist`이면 `items` 배열이 있다.
- [ ] `layer=golden-blind`이면 `blind`에 `N`, `M`, `accuracy`, `band`, `user_confirmation{verdict, note, timestamp}`가 있다.
- [ ] `layer=realgen`이면 `realgen`에 `path`(`A-mcp`/`B-manual`)와 `iterations` 배열이 있고 반복은 최대 3회다.
