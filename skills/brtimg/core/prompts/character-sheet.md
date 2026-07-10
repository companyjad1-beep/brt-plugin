# 캐릭터 시트 작성 규칙

이 문서는 장면 프롬프트 생성 없이 캐릭터 시트만 생성하거나 개정하는 절차를 정의한다. 산출물은 `core/schema/character-sheet.schema.json` 규격의 `workspace/characters/*.yaml` 파일이며, 이후 `series-injection.md` 규칙으로 시리즈에 주입된다. 시리즈 요청에서 `characterSheet=생성 요청`이 들어온 경우에도 이 문서의 절차로 시트를 먼저 만든 뒤 시리즈 절차를 이어간다.

## 1. 입력

- `description`: 인물 설명 텍스트. 신규 생성 시 필수.
- `base`: 개정할 기존 캐릭터 시트 경로. 개정 시 필수.
- `refs[]`: 선택. 참고 이미지 경로 목록. 있으면 `modes.md`의 `multimodal` 분석 규칙(구도·조명·색·스타일·인물 특징)을 적용하되, 인물 특징 항목만 시트에 반영한다.

`description`과 `base`가 모두 없으면 `conversational`로 전환한다. 질문 우선순위는 `modes.md`의 일반 우선순위 대신 정체성 중심으로 재정의한다.

1. 인물의 역할과 용도: 어떤 브랜드·도메인에서 반복 사용할 인물인가.
2. 외모 골격: 나이대, 성별 표현, 얼굴형, 헤어.
3. 고유 마커: 점, 안경, 액세서리 등 컷 간 동일 인물 판정에 쓸 특징.
4. 금지 사항: 바뀌면 안 되는 것과 피할 표현.

질문은 한 번에 1개, 최대 3라운드 규칙을 그대로 따른다.

사용자가 선택형(커스터마이징) 진행을 원하거나 `mode=guided`가 지정되면, 위 3라운드 제한 대신 `appearance-catalog.md`의 4라운드 프리셋 선택 절차로 진행한다. 이때도 모든 축은 패스 가능하고, 확정 전에 합성 문장과 `signatureFeatures` 후보를 보여준다.

## 2. 필드 작성 규칙

필수 필드 계약은 스키마와 `storage-conventions.md`의 수동 감사 항목을 따른다: `schemaVersion: 1`, `id`, `name`, `appearance{face, hair, eyes, skin, build, signatureFeatures[]}`, `identityAnchors[]`(1개 이상), `referenceImagePaths[]`, `negativeConstraints[]`, `createdAt`. 선택 필드: `wardrobeDefaults`, `voiceTone`, `notes`, `schemaKind`.

작성 지침:

- `appearance` 하위 필드는 `persona-marketing.md` 2.1의 외모 구체성 규칙을 따른다. 관찰 가능한 시각 언어로만 쓰고, "아름다운" 같은 평가어를 쓰지 않는다.
- `appearance.signatureFeatures`는 컷 간 동일 인물 판정에 쓸 수 있는 고유 마커 2~4개로 제한한다. 위치를 함께 쓴다. 예: `왼쪽 볼 아래의 작은 점`.
- `identityAnchors`는 장면이 바뀌어도 유지할 의무를 문장으로 쓴다. 인상·용도 앵커와 시각 앵커를 섞어도 되지만, 시각 유지 항목 최소 1개를 포함한다.
- `negativeConstraints`는 정체성 훼손을 막는 금지문으로 쓴다. `signatureFeatures` 누락 금지를 최소 1개 포함한다.
- `referenceImagePaths`는 실재하는 경로만 넣는다. 참고 이미지가 없으면 빈 배열로 두고 추정 경로를 만들지 않는다.
- `id`는 `character-<slug>-NNN` 형태의 영문 소문자 케밥 표기를 사용한다.
- 사용자가 주지 않은 정보는 추정으로 채우지 않는다. 3라운드 질문 후에도 비는 선택 필드는 생략하고, 필수 필드만 최소 가정으로 채운 뒤 가정 내용을 최종 응답에 명시한다.

## 3. 실존 인물 금지

실존 인물, 연예인, 공인의 정체성 복제를 요구받으면 그대로 만들지 않는다. 요청의 무드·스타일 축만 남기고 가상 인물로 재정의하며, 재정의 사실을 최종 응답에 남긴다. 시트 `notes`에 가상 인물임을 명시한다.

## 4. 개정 규칙

- 기존 시트를 덮어쓰지 않는다. 새 파일을 만들고 `supersedes`에 이전 경로를 기록한다(`storage-conventions.md` 준용).
- 개정 시 `identityAnchors`와 `signatureFeatures`의 기존 항목을 임의로 삭제하지 않는다. 사용자가 명시적으로 바꾼 항목만 수정한다.
- `schemaVersion`은 개정 번호로 올리지 않는다.

## 5. 저장과 검증

1. `workspace/characters/name.yaml` 경로 규칙으로 저장한다(예: `workspace/characters/han-minseo.yaml`, 개정본은 `han-minseo-2.yaml`처럼 slug를 구분).
2. `node core/tools/validate.mjs <저장경로> --schema character-sheet`를 실행한다.
3. 실행할 수 없으면 `storage-conventions.md`의 character-sheet 수동 감사 체크리스트로 대체한다.

## 6. 출력 계약

시트 생성·개정의 최종 응답에는 다음을 포함한다. 프롬프트 산출물 계약(최종 프롬프트, 변형 2종)은 적용하지 않는다.

- 저장 경로
- 캐릭터 고정 블록 미리보기: `series-injection.md` 3절 규칙으로 생성한 블록 문자열. 시리즈에서 실제로 주입될 문자열과 동일해야 한다.
- 가정 및 재정의 내역: 최소 가정으로 채운 필드, 실존 인물 재정의 여부.
- 검증 결과 또는 수동 감사 결과

## 7. 자가점검 3항목

1. 스키마 충족: 필수 필드가 전부 있고 `validate.mjs` 또는 수동 감사를 통과했는가.
2. 주입 호환: 고정 블록 미리보기가 `series-injection.md` 3절 결합 규칙과 순서를 지켰는가.
3. 재현 가능성: `signatureFeatures`와 `identityAnchors`만으로 다른 세션에서도 같은 인물을 지시할 수 있는가.
