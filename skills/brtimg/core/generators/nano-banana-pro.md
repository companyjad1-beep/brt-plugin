# Nano Banana Pro 생성기 가이드

## 1. 모델 개요/스펙

- 모델명: Nano Banana Pro = Gemini 3 Pro Image.
- 역할: GPT Image 2.0을 이미지 1순위로 두고, Nano Banana Pro는 긴 컨텍스트, 다중 참조, 인물 일관성, 텍스트·현실 지식 기반 이미지가 필요한 보조 생성기로 사용한다.
- 입력 컨텍스트: 최대 65,536 토큰.
- 해상도: 1K, 2K, 4K.
- 지원 비율: 1:1, 3:2, 2:3, 3:4, 4:3, 4:5, 5:4, 9:16, 16:9, 21:9.
- 참조 이미지: 최대 14개. 각 참조가 Identity, Pose, Style, Lighting, Environment 중 무엇을 제어하는지 명시해야 한다.
- 강점: 크리에이티브 디렉터 브리프형 프롬프트, 이미지 안 텍스트·현지화, 다중 이미지 블렌딩, 인물·브랜드 룩 유지, 대화형 부분 수정.
- 사용 전제: 이 프로젝트에서는 OAuth 구독 CLI 사용을 전제로 하며 API 키 기반 독립앱 설계는 범위 밖이다.

## 2. 최적 프롬프트 템플릿(섹션별)

Nano Banana Pro는 “태그 수프”보다 크리에이티브 디렉터의 제작 브리프에 가깝게 작성한다. 핵심 구조는 Subject / Composition / Action / Location / Style이며, 카메라·조명·텍스트를 같은 브리프 안에 통합한다.

```text
Reference Roles:
Image 1 = [Identity reference: 얼굴과 고유 닮음만 제어]
Image 2 = [Pose reference: 자세와 손 위치만 제어]
Image 3 = [Style reference: 색감과 그래픽 톤만 제어]
Image 4 = [Lighting reference: 조명 방향과 대비만 제어]
Image 5 = [Environment reference: 배경 공간만 제어]

Identity Header:
[동일 인물로 유지할 얼굴 기하, 헤어, 피부 톤, 고유 마커, 나이, 인식 가능한 닮음]

Subject:
[주 피사체와 제품/브랜드 요소]

Composition:
[종횡비, 프레이밍, 앵글, 렌즈감, 여백, 배치]

Action:
[피사체의 행동, 시선, 포즈, 손동작]

Location:
[장소, 시간대, 환경, 배경 맥락]

Style:
[매체, 마감, 컬러 팔레트, 질감, 브랜드 톤]

Camera & Lighting:
[카메라 앵글, 심도, 광원 방향, 색온도, 대비]

Typography:
Render exactly: "[정확한 문구]"
[폰트 스타일, 위치, 정렬, 크기, 언어, 추가 텍스트 금지]

Hard Negative:
[no morphing, no identity drift, no extra people, no misspelled text, no watermark]
```

편집은 한 번에 너무 많은 변경을 넣지 말고, 80% 이상 맞으면 재생성보다 대화형 부분 수정으로 좁힌다.

## 3. 필수 포함 요소 체크리스트

- [ ] 참조 이미지별 역할이 Identity/Pose/Style/Lighting/Environment로 분리되어 있다.
- [ ] Identity Header에 얼굴 기하, 헤어라인, 헤어스타일, 피부 톤, 고유 마커, 나이를 잠갔다.
- [ ] Subject, Composition, Action, Location, Style이 모두 명시되어 있다.
- [ ] 카메라 앵글, 렌즈감, 심도, 조명 방향, 색온도 중 필요한 요소가 들어 있다.
- [ ] 원하는 문구는 따옴표로 감싸고, 폰트는 이름보다 스타일과 배치 중심으로 설명했다.
- [ ] 종횡비와 해상도 목표가 명시되어 있다.
- [ ] 하드 네거티브에 no morphing, no identity drift, no extra text, no watermark가 들어 있다.
- [ ] 후속 편집에도 동일 레퍼런스 재첨부와 핵심 제약 재진술을 전제로 한다.

## 4. 금기

- 태그 수프: “portrait, cinematic, best quality, ultra detail, 4K”처럼 쉼표 태그만 나열하지 않는다.
- 참조 역할 혼합: 스타일 참조가 얼굴을 바꾸거나, 포즈 참조가 아이덴티티를 덮어쓰지 않도록 역할을 제한한다.
- 텍스트 모호화: “한글 카피 추가” 대신 정확한 문구를 따옴표로 지정한다.
- 과도한 일괄 편집: 배경, 의상, 포즈, 얼굴, 조명, 타이포를 한 번에 모두 바꾸지 않는다.
- 재생성 남발: 80% 이상 맞는 결과는 전체 재생성보다 “오른손만 자연스럽게”, “헤드라인 철자만 수정”처럼 부분 수정한다.
- 인물 고정 없는 스타일화: 강한 일러스트·패션·시네마 스타일은 얼굴을 평균화할 수 있으므로 identity lock 없이 적용하지 않는다.
- 하드 네거티브 누락: no morphing, no face swap, no identity drift가 없으면 다중 참조에서 얼굴이 섞일 수 있다.

## 5. 인물 고정 수단

1. 매 작업에서 동일한 Identity reference를 다시 첨부한다.
2. 참조 이미지 역할을 문장 첫머리에 선언한다. 예: “Image 1 controls identity only; Image 2 controls pose only; Image 3 controls lighting only.”
3. Identity Header를 사용해 얼굴 기하, 눈 모양, 코, 입, 턱선, 광대, 피부 톤, 헤어라인, 헤어스타일, 나이, 고유 마커를 잠근다.
4. 하드 네거티브를 넣는다: `no morphing`, `no face swapping`, `no blending`, `no beautifying`, `no identity drift`, `do not average faces`.
5. 스타일 참조는 “색감/질감/레이아웃에만 적용, 얼굴에는 적용하지 않음”이라고 제한한다.
6. 후속 편집마다 같은 레퍼런스를 재첨부하고 Identity Header와 Hard Negative를 반복한다.
7. 결과가 80% 이상 맞으면 재생성하지 말고 대화형 부분 수정으로 좁힌다.

## 6. 예시 프롬프트 1개(인물 마케팅 도메인)

```text
Reference Roles:
Image 1 = Identity reference only for the founder's face and recognizable likeness.
Image 2 = Pose reference only for the relaxed seated pose and hand placement.
Image 3 = Style reference only for the clean premium skincare campaign color palette.
Image 4 = Lighting reference only for soft window light from camera left.
Image 5 = Environment reference only for the minimalist refill-store background.

Identity Header:
Preserve the same Korean female founder from Image 1: oval face geometry, calm almond-shaped eyes, straight natural black bob haircut, same hairline, warm light-medium skin tone, small beauty mark on the right cheek, same nose, lips, jawline, age in mid-30s, and recognizable likeness. Image 1 controls identity only.

Subject:
동일한 창업자가 리필형 친환경 스킨케어 세럼 병을 들고 있는 프리미엄 브랜드 캠페인 이미지.

Composition:
4:5 vertical poster, 2K target, medium close-up from waist up, eye-level camera, 50mm editorial portrait feel, subject placed on the right third, clean negative space on the upper-left for headline.

Action:
카메라를 향해 차분하고 자신감 있게 미소 짓고, 세럼 병의 라벨이 보이도록 자연스럽게 든다. 어깨와 손은 긴장 없이 편안하다.

Location:
서울의 밝고 미니멀한 리필 스토어 겸 브랜드 스튜디오. 뒤쪽 선반에는 유리 리필 용기와 식물이 부드럽게 흐려져 보인다.

Style:
프리미엄 K-뷰티 런칭 캠페인, 자연스러운 피부 질감, 절제된 세트 디자인, 크림·세이지·따뜻한 원목 팔레트, 스톡사진 느낌 없이 실제 브랜드 화보처럼.

Camera & Lighting:
Soft window key light from camera left, gentle fill, shallow depth of field, natural highlights on skin and glass bottle, neutral warm color grading, no harsh retouching.

Typography:
Render exactly: "피부가 쉬는 시간"
Place it in the upper-left negative space. Use a thin modern Korean sans-serif style, cream-white color, generous letter spacing, sharp and correctly spelled. No other text.

Hard Negative:
No morphing, no face swap, no identity drift, no averaging faces, no beautifying into a different person, no altered ethnicity or age, no extra people, no extra products, no misspelled Korean text, no duplicate headline, no random logos, no watermark, no plastic skin.
```

## 7. 근거 링크+수집일

- Google Cloud Blog, “Ultimate prompting guide for Nano Banana”: https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-nano-banana
- Google Blog, “7 tips to get the most out of Nano Banana Pro”: https://blog.google/products-and-platforms/products/gemini/prompting-tips-nano-banana-pro/
- fal.ai, “Nano Banana Pro Prompting Guide”: https://fal.ai/learn/tools/nano-banana-pro-prompting-guide
- fal.ai, “Nano Banana Pro API reference”: https://fal.ai/docs/model-api-reference/image-generation-api/nano-banana-pro
- 수집일: 2026-07-07
