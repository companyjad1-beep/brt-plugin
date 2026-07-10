# 턴어라운드 그리드 시트 생성 규칙 (turnaround-sheet)

이 문서는 캐릭터 참조용 턴어라운드 그리드 시트(단일 이미지 7분할)를 생성하는 생성기별 프롬프트 템플릿을 정의한다. 시트는 크롭 소스이자 다각도 기하 참조다. 그리드 **단독** 참조는 얼굴당 해상도가 낮아 정체성 인코딩이 약함이 실측으로 확인됐다. 단, 고해상 단독 컷과 **병용**하는 이중 첨부(단독 컷=정체성, 시트=다각도 기하·헤어)는 일관성을 강화한다는 실전 운용 사례(2026-07-08, Threads @reactor_art, GPT Image·Gemini 공통)가 있어 5절 레시피로 반영한다.

## 1. 패널 규격 (두 생성기 공통)

- 상단 행 — 전신 4패널(좌→우): 정면 / 좌측 프로필 / 우측 프로필 / 정후면. 같은 카메라 높이(가슴)·같은 거리·같은 스케일, 머리부터 발끝까지.
- 하단 행 — 얼굴 3패널(좌→우): 정면 클로즈업(어깨 위) / 좌측 프로필 클로즈업 / 후면 3/4 클로즈업. 얼굴이 패널 높이의 70% 이상.
- 전 패널 공통: 밝은 아이보리 시임리스 배경, 5600K 균일 소프트 확산광, 그림자 최소, 패널 간 조명·색 변화 0.
- 자세: 차렷에 가까운 이완 기립, 팔은 옆에, 포즈 변형 금지. 표정 중립·입 다묾, 정면 패널만 카메라 응시.
- 실측 메모(2026-07-08, GPT Image·Gemini·Grok 교차): 패널 번호를 명시하지 않으면 프로필 전신 패널이 탈락하고 원단·신발 디테일 컷이 증식하며, 문미 금지 목록만으로는 시트류 프라이어의 제목·라벨 렌더를 막지 못한다. 템플릿의 패널 번호, 문두 문자 금지, 디테일 컷 금지 문장을 삭제하지 않는다.

## 2. 슬롯 주입 규칙

- `[인물 서술]` / `[APPEARANCE BLOCK]`: 캐릭터 시트가 있으면 `series-injection.md` 3절 규칙으로 만든 캐릭터 고정 블록을 넣는다. 시트가 없으면 `appearance-catalog.md` 선택값 합성문 또는 사용자 서술을 넣는다.
- `[의상]` / `[WARDROBE]`: 시트의 `wardrobeDefaults` 또는 사용자 지정. 기본값: 몸 실루엣이 드러나는 무채색 민소매 탑 + 스트레이트 팬츠, 맨발.
- 기존 인물 이미지로 시트를 다시 만들 때: 인물 이미지를 @ref1로 첨부하고 템플릿 앞에 정체성 전용 선언을 추가한다 — nano-banana-pro는 `Reference role: @ref1 = identity only. Lock face geometry, eye shape, nose, lip shape, jawline, skin tone, hairline, and hairstyle from @ref1; never copy its pose, expression, clothing, accessories, lighting, or background.`, gpt-image-2는 `참조 역할: 첨부한 이미지(@ref1)는 정체성 전용이다. 얼굴 기하, 눈코입 형태, 턱선, 피부 톤, 헤어라인과 헤어스타일을 이 이미지에서 잠그고, 포즈·표정·의상·액세서리·조명·배경은 가져오지 않는다.` 참조에 귀걸이·초커 등 눈에 띄는 액세서리가 있으면 비전이 목록에 품목을 명시한다(실측: 액세서리 미명시 시 전이 관찰됨). 정체성 고정력은 nano-banana-pro가 더 강하므로 드리프트가 보이면 nano로 재생성한다. 텍스트 축 선택값이 있으면 `[인물 서술]`에 `@ref1과 동일 인물. 보조 앵커:` 접두어로 병기한다.

## 3. 템플릿 — GPT Image 2.0 (한국어 자연문형)

```text
문자 절대 금지 — 이미지 안에 제목, 캡션, 라벨, 박스, 로고, 워터마크 등 어떤 글자도 렌더링하지 않는다. 캐릭터 턴어라운드 사진 그리드, 단일 이미지 안에 정확히 7개 패널(2행). 배경은 전 패널 공통 밝은 아이보리 시임리스, 그림자 최소, 균일한 소프트 확산광(5600K), 패널 간 조명·색 완전 동일.

상단 행 전신 4패널(좌→우) — 패널1: 정면 전신, 패널2: 왼쪽 옆모습 전신, 패널3: 오른쪽 옆모습 전신, 패널4: 정후면 전신. 4패널 모두 머리부터 발끝까지 보이고 같은 크기·같은 카메라 높이(가슴)·같은 거리.
하단 행 얼굴 3패널(좌→우) — 패널5: 정면 클로즈업(어깨 위), 패널6: 왼쪽 옆모습 클로즈업, 패널7: 후면 3/4 클로즈업. 얼굴이 패널 높이의 70% 이상을 차지하도록 크게.
이 7개 외 패널 추가 금지 — 원단·신발·허리 등 부분 확대 디테일 컷 패널을 만들지 않는다.

인물(모든 패널에서 완전히 동일 인물):
[인물 서술]

의상: [의상], 맨발, 액세서리는 인물 서술에 포함된 것만. 자세: 팔을 옆에 둔 이완 기립, 포즈 변형 금지. 표정: 중립, 입 다묾, 정면 패널만 카메라 응시.

품질: 실사 인물 사진 질감, 피부 결·모공 유지, 보정 없음, 7패널 전부에서 얼굴 기하·헤어·피부 톤 완전 일치.
금지: 패널 간 인물 변화, 포즈 변형, 소품, 부분 확대 디테일 패널, 텍스트·제목·캡션·라벨·워터마크, 배경 요소, 잘린 신체, 패널 수 증감.
```

## 4. 템플릿 — Nano Banana Pro (영문 구조형)

```text
Hard rule first: render absolutely no text — no title, no captions, no labels, no boxes, no logos, no watermark anywhere in the image. Character turnaround photo grid — one single image, exactly 7 panels in 2 rows, the identical person in every panel.

Layout: top row, four full-body panels left to right — panel 1: front, panel 2: left profile, panel 3: right profile, panel 4: back. Same camera height (chest level), same distance, same scale, head-to-toe visible. Bottom row, three face panels left to right — panel 5: front close-up (shoulders up), panel 6: left profile close-up, panel 7: three-quarter back close-up. The face fills at least 70% of panel height. No panels beyond these seven — no fabric, shoe, or waist detail-crop panels.

Global conditions: seamless light-ivory backdrop in all panels, even soft diffuse light at 5600K, minimal shadows, zero lighting or color variation between panels.

Identity (must be pixel-consistent across all seven panels):
[APPEARANCE BLOCK]

Wardrobe: [WARDROBE], barefoot, only accessories defined in the identity block. Pose: relaxed standing, arms at sides, no pose variation. Expression: neutral, mouth closed, eye contact in the front panels only.

Quality: photoreal skin with visible texture and pores, no retouching, identical face geometry, hair, and skin tone in every panel.
Hard negative: no identity variation between panels, no pose changes, no props, no detail-crop panels, no text, title, captions, labels, or watermark, no background elements, no cropped limbs, no extra or missing panels.
```

## 5. 생성 후 활용

1. 복수 생성기 산출물이 있으면 크롭 소스는 **패널 규격 준수가 아니라 원본 닮음 우선**으로 고르고, 닮음 판정은 사용자(사람 심판)에게 확인받는다. 실측(2026-07-08, 사람 심판): 규격은 gpt-image-2가 우위였으나 원본 닮음은 nano-banana-pro(Gemini)가 압승 — 크롭 소스의 목적은 정체성 인코딩이므로 닮음이 결정 축이다.
2. 채택 시트의 하단 정면 패널과 프로필 패널을 크롭해 `workspace/characters/refs/`에 저장한다.
3. 캐릭터 시트의 `referenceImagePaths`에 크롭 경로를 등록한다(그리드 원본이 아니라 크롭을 등록).
4. 이후 장면 프롬프트에서는 크롭을 정체성 참조로 첨부하고, 텍스트는 캐릭터 고정 블록으로 이중 고정한다. 규격 우위 시트는 포즈·기하 대조용으로 함께 보관해도 된다.
5. 이중 첨부 레시피(권장): 장면 프롬프트에서 @ref1 = 고해상 단독 컷(정체성 전용), @ref2 = 턴어라운드 시트 원본(같은 인물의 각도별 얼굴 기하·헤어 형태 참조 전용)으로 함께 첨부한다. 이때 반드시 두 가지를 명시한다 — (a) 시트의 의상·배경·포즈 비전이, (b) "출력은 단일 컷이며 참조의 다분할 그리드 레이아웃을 복제하지 않는다"(그리드 누출 방지). 시트 단독 첨부는 여전히 금지.

## 5.5 제품 턴어라운드 시트 (2026-07-08 페이블5 실물 분석 흡수)

제품 중심 캠페인은 인물 시트와 대칭으로 **제품 시트**를 먼저 만든다. 규격(단일 이미지 3구획, 표제 렌더 허용): ① `1. HERO` — 브랜드 무드 배경 위 제품 히어로 컷(라벨 정면, 재질·물방울 등 질감 연출) ② `2. 360: FRONT / SIDE / BACK` — 뉴트럴 배경에 동일 스케일 3각도, 라벨 문구·로고 비율이 각도 간 일관될 것 ③ `3. DETAIL` — 뚜껑·라벨·표면 질감 등 클로즈업 2~3분할. 라벨 문구는 따옴표로 정확 지정하고 전 구획에서 동일 렌더를 강제한다. 이후 장면·스토리보드에서 이 시트를 제품 정체성 참조(@ref)로 첨부한다 — persona-marketing.md 3.1 제품 노출 규칙과 함께 적용.

## 6. 자가점검 3항목

1. 패널 완전성: 7패널(전신 4 + 얼굴 3)이 규격 순서대로 있고 잘린 신체가 없는가.
2. 패널 간 동일성: 얼굴 기하·헤어·피부 톤이 전 패널에서 같은 인물로 읽히는가.
3. 크롭 적합성: 하단 얼굴 패널이 크롭해서 단독 참조로 쓸 만큼 크고 선명한가.
