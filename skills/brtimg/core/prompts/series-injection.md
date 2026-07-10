# 캐릭터 시트 시리즈 주입 규칙

이 문서는 `workspace/characters/*.yaml` 캐릭터 시트를 읽어 시리즈 내 모든 프롬프트에 같은 인물 정체성을 주입하는 규칙이다. 캐릭터 시트는 `core/schema/character-sheet.schema.json` 규격을 따르며, 필드는 다음 계약을 기준으로 사용한다: `schemaVersion`, `id`, `name`, `appearance`, `identityAnchors`, `referenceImagePaths`, `wardrobeDefaults`, `negativeConstraints`, `createdAt`.

## 1. 적용 시점

다음 조건 중 하나라도 맞으면 캐릭터 시트 주입을 수행한다.

- 사용자가 시리즈, 캠페인 묶음, 여러 컷, 여러 장면을 요청한다.
- 동일 인물이 반복 등장한다.
- `characterSheetRef`가 제공된다.
- `workspace/characters/*.yaml` 중 사용자가 지정한 캐릭터 ID 또는 이름과 일치하는 파일이 있다.

캐릭터 시트가 없으면 새 정체성을 임의로 고정하지 않는다. 사용자 입력에 있는 인물 설명만 사용하고, 설계메모의 `assumptions`에 캐릭터 시트 부재를 남긴다. 사용자가 시트 생성을 요청하면(`characterSheet=생성 요청`) `core/prompts/character-sheet.md` 절차로 시트를 먼저 만들어 저장한 뒤 이 문서의 주입 규칙을 적용한다.

## 2. 캐릭터 시트 읽기

캐릭터 시트에서 다음 값을 추출한다.

```text
id: 캐릭터 고유 ID
name: 캐릭터 이름 또는 표시명
appearance.face: 얼굴형, 턱선, 코, 입, 광대
appearance.hair: 헤어 길이, 색, 질감, 헤어라인
appearance.eyes: 눈 모양, 눈빛, 눈썹 특징
appearance.skin: 피부 톤, 피부 질감, 주근깨 또는 점
appearance.build: 체형, 키 느낌, 실루엣
appearance.signatureFeatures: 고유 마커 목록
identityAnchors: 반드시 유지할 정체성 앵커
referenceImagePaths: 참조 이미지 경로 목록
wardrobeDefaults: 기본 의상 또는 장면 의상 미지정 시 사용할 의상 단서
negativeConstraints: 피해야 할 정체성 변화와 생성 오류
```

누락 필드는 추정으로 채우지 않는다. 필요한 경우 프롬프트에서 해당 항목을 생략하고, 설계메모의 `assumptions`에 `캐릭터 시트에 해당 필드가 없음`이라고 적는다.

## 3. 외모 서술 블록 자동 삽입

시리즈 내 모든 프롬프트에 동일한 외모 서술 블록을 삽입한다. 문구는 컷마다 바꾸지 않고 같은 문자열로 유지한다.

### 블록 생성 규칙

1. `name`과 `id`는 내부 식별에만 사용하고, 컷별 외모 블록 문자열에는 임의로 섞지 않는다.
2. 외모 블록의 첫 문장은 `appearance.face` → `appearance.hair` → `appearance.eyes` → `appearance.skin` → `appearance.build` 순서로만 구성한다.
3. 첫 문장의 각 하위 필드는 쉼표+공백(`, `)으로 연결하고, 배열 값도 쉼표+공백으로 결합한다. 마지막 항목 앞에 `그리고`를 넣지 않는다.
4. `appearance.signatureFeatures`는 같은 첫 문장 끝에 `고유 특징:` 접두어를 붙여 나열한다.
5. `identityAnchors`는 두 번째 문장에만 넣고 `반드시 유지:` 접두어를 붙인다.
6. 누락 필드는 추정하지 않고 생략한다. 생략 후에도 남은 항목의 상대 순서와 결합 규칙은 유지한다.
7. `negativeConstraints`는 생성기별 제약 섹션에도 반복한다.

예시 형식:

```text
캐릭터 고정 블록:
[face], [hair], [eyes], [skin], [build], 고유 특징: [signatureFeatures]. 반드시 유지: [identityAnchors].
```

동일 입력에서 생성되는 모든 컷은 위 형식과 결합 규칙으로 만든 외모 블록 문자열을 그대로 재사용한다. 사람이 읽기 좋게 바꾸거나 컷별 문장 순서를 재배열하지 않는다.

시리즈의 각 장면 프롬프트는 이 블록 뒤에 장면별 행동, 배경, 구도, 조명, 스타일을 덧붙인다.

장면이 의상을 지정하지 않으면 `wardrobeDefaults`를 장면 의상으로 사용한다. 장면이 의상을 지정하면 장면 의상을 우선하되, `identityAnchors`와 충돌하는 색, 소품, 실루엣, 고유 마커 제거는 허용하지 않는다.

## 4. 타깃 생성기 기본값

사용자가 타깃 생성기를 지정하지 않은 시리즈 요청은 출력 매체로 기본값을 결정한다.

- 이미지 시리즈: `gpt-image-2`.
- 영상 시리즈: `seedance-2`.

## 5. 생성기별 참고 이미지 지시문 변환

### 5.1 GPT Image 2

`gpt-image-2`에서는 외모 서술 블록을 `Subject` 또는 `Preserve`에 넣고, 참조 이미지는 보존 리스트와 함께 사용한다.

```text
Subject:
[캐릭터 고정 블록] 이번 장면에서는 [장면별 행동]을 한다.

Preserve:
referenceImagePaths의 모든 이미지는 동일 인물의 얼굴, 아이덴티티, 얼굴 기하, 피부 톤, 헤어라인, 헤어스타일, 눈·코·입·턱선, 나이, 인식 가능한 닮음을 보존하는 데만 사용한다.

Constraints:
얼굴 리디자인, 얼굴 교체, 나이 변화, 피부 톤 변화, 헤어라인 변화, 추가 인물, 왜곡된 손, 워터마크 없음.
```

편집 요청이면 반드시 `Change / Preserve / Constraints`로 나누고, 장면별 변경은 `Change`에만 둔다.

### 5.2 Nano Banana Pro

`nano-banana-pro`에서는 참조 이미지 역할 지정과 `Identity Header`를 사용한다.

```text
Reference Roles:
Image 1 = Identity reference only for [name]의 얼굴과 인식 가능한 닮음.
Image 2 = Pose reference only, 장면별 포즈가 있을 때만 사용.
Image 3 = Style reference only, 색감과 조명에만 적용하고 얼굴에는 적용하지 않음.

Identity Header:
[캐릭터 고정 블록] Image 1 controls identity only. Preserve face geometry, eyes, nose, mouth, jawline, hairline, hairstyle, skin tone, body proportions, age, and recognizable likeness.

Hard Negative:
no morphing, no face swap, no identity drift, no averaging faces, no beautifying into a different person, no altered age, no altered ethnicity, no extra people.
```

참조 이미지가 여러 장이면 각 이미지가 Identity, Pose, Style, Lighting, Environment 중 무엇을 제어하는지 한 줄씩 선언한다.

### 5.3 Seedance 2

`seedance-2`에서는 `@Image` 태그와 얼굴 고정 제약문을 사용한다.

```text
Reference:
Use @Image 1 as the strict identity reference for [name]. Use @Image 2 only for pose or outfit if provided. Use @Image 3 only for lighting, color, or environment if provided.

Prompt:
[캐릭터 고정 블록] [장면별 행동], in [장면별 환경], [카메라 움직임 1개], [영상 스타일].

Identity Constraint:
Preserve the same face, hairstyle, hairline, skin tone, body proportions, signature features, age, and recognizable likeness throughout the entire video. Do not copy identity from motion or style references. No identity drift, no face deformation, no flickering face, no outfit change unless explicitly allowed.
```

영상 참고가 있을 때는 `@Video`를 카메라 리듬과 동작 참고로만 사용하고, 인물 정체성을 복제하지 않는다.

## 6. 장면별 변경 허용 범위

캐릭터 시트가 주입된 시리즈에서는 장면마다 바꿀 수 있는 요소와 유지해야 할 요소를 분리한다.

### 변경 가능

- 배경: 실내, 야외, 스튜디오, 매장, 거리, 사무실.
- 포즈: 앉기, 걷기, 제품 들기, 카메라 바라보기, 옆모습.
- 의상: 사용자가 허용한 경우에만 색, 소재, 스타일 변경.
- 조명: 하이키, 로우키, 자연광, 림 라이트, 골든아워.
- 구도: 클로즈업, 미디엄 샷, 전신, 대칭, 삼분법.
- 무드: 친근함, 전문성, 프리미엄, 시네마틱.

### 항상 유지

- 얼굴 기하와 인식 가능한 닮음.
- 헤어라인, 기본 헤어 형태, 피부 톤.
- 눈, 코, 입, 턱선의 비율.
- 체형과 나이대.
- `signatureFeatures`.
- `identityAnchors`.
- 캐릭터 시트의 `negativeConstraints`.

의상 변경이 허용되어도 정체성 앵커를 침범하면 안 된다. 예를 들어 안경이 `signatureFeatures`라면 의상 변화 중에도 안경을 유지한다.

## 7. 시리즈 프롬프트 작성 절차

1. 캐릭터 시트를 선택한다.
2. 외모 서술 블록을 만든다.
3. 생성기별 참조 이미지 지시문으로 변환한다.
4. 각 장면의 목적, 행동, 배경, 구도, 조명, 스타일을 작성한다.
5. 모든 장면에 동일한 외모 서술 블록과 정체성 제약을 반복한다.
6. 장면별 변경점은 별도 문장으로만 추가한다.
7. 시리즈 생성 후 각 컷의 외모 블록 문자열이 byte-동일한지 비교한다.
8. 최종 체크에서 정체성, 참조 이미지, 금지 조건이 누락되지 않았는지 확인한다.

## 8. 시리즈 일관성 자가점검 3항목

각 프롬프트를 제출하기 전에 다음 3항목을 확인한다.

1. 외모 블록 일치: 모든 장면의 캐릭터 고정 블록 문자열이 byte-동일한가.
2. 참조 역할 분리: Identity, Pose, Style, Lighting, Environment 참조가 서로 섞이지 않았는가.
3. 변경 범위 통제: 배경, 포즈, 의상, 조명은 장면별로 바뀌더라도 얼굴, 헤어라인, 피부 톤, 체형, 고유 특징, 정체성 앵커는 유지되는가.

체크 결과는 `checklistResults`에 `충족`, `부분 충족`, `미달`, `판정 불가` 중 하나로 기록한다.
