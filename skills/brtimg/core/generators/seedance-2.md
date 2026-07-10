# Seedance 2.0 프롬프트 가이드

수집일: 2026-07-07  
대상: ByteDance/Dreamina Seedance 2.0 영상 생성 프롬프트

## 1. 개요/스펙

Seedance 2.0은 ByteDance 계열의 영상 생성 모델로, 텍스트뿐 아니라 이미지, 비디오, 오디오 참조를 함께 쓰는 멀티모달 오디오-비디오 생성 흐름을 전제로 설계한다. 실무 프롬프트는 “이미지처럼 장면을 묘사”하는 방식보다, 감독이 샷을 지시하듯 피사체, 동작, 환경, 카메라, 스타일, 제약을 순서대로 고정하는 방식이 안정적이다.

핵심 스펙과 운용 기준:

- 입력: 텍스트, 이미지, 비디오, 오디오 참조를 조합해 피사체, 움직임, 카메라 리듬, 음성/사운드 분위기를 지정한다.
- 출력: 짧은 클립 중심. 공식·모델카드 계열 자료는 4–15초 생성 범위를 언급한다.
- 오디오: 네이티브 오디오-비디오 동시 생성과 대사/환경음/폴리(foley) 지시를 활용한다.
- 립싱크: 음성 참조나 대사 지시가 있을 때 입 모양, 발화 리듬, 감정, 호흡을 명시한다. “8언어+ 립싱크”는 리서치 요약에 포함된 현장 정보이나, 공식 공개 문서에서 언어 목록까지는 별도 검증이 필요하다.
- 멀티샷: 단일 프롬프트 안에서 Shot 1/2/3 또는 `[0s]`, `[3s]`, `[6s]` 타임라인을 사용할 수 있다.
- 반복 개선: 한 번에 변수 하나만 변경한다. 카메라, 동작, 스타일, 제약을 동시에 바꾸면 어떤 변경이 결과를 개선했는지 추적할 수 없다.

## 2. 6단계 템플릿

공식 해설과 실무 가이드는 다음 6단계 순서를 공통 골격으로 사용한다.

```text
Subject → Action → Environment → Camera → Style → Constraints
```

### 작성 원칙

1. Subject: 누구/무엇인지, 유지해야 할 정체성 특징을 먼저 쓴다.
2. Action: 감정어보다 보이는 동작을 쓴다. 손, 시선, 어깨, 옷감, 제품 움직임처럼 화면에 보이는 변화를 지정한다.
3. Environment: 장소, 시간대, 조명, 날씨, 배경 밀도를 쓴다.
4. Camera: 샷 크기, 카메라 움직임, 앵글 또는 렌즈 느낌을 한 줄로 쓴다.
5. Style: 광고, 다큐멘터리, 시네마틱, 패션 필름 등 하나의 톤으로 통일한다.
6. Constraints: 흔들림, 신체 왜곡, 얼굴 변형, 흐림, 고스트, 플리커, 자막/워터마크를 명시적으로 금지한다.

### 마스터 템플릿

```text
[Subject: 고정할 피사체와 특징], [Action: 보이는 동작과 속도/힘],
in [Environment: 장소, 시간, 조명, 분위기],
[Camera: 샷 크기 + 카메라 움직임 1개 + 앵글/렌즈 느낌],
[Style: 영상 톤, 색감, 질감, 품질].
[Constraints: 정체성 유지, 자연스러운 모션, 금지할 결함].
```

### 길이 기준

- 권장: 60–100단어.
- 현장 메모: 안정성이 우선이면 60단어 미만의 짧은 본문에 강한 제약문을 붙인 형태가 더 잘 작동할 때가 있다.
- 장문 프롬프트는 같은 샷 안에 서로 충돌하는 카메라·동작·스타일 지시가 섞이기 쉬우므로, 각 단어가 결과에 필요한지 점검한다.

## 3. 필수 포함 요소 체크리스트

- [ ] Subject 정체성 단서가 먼저 고정되어 있다.
- [ ] Action은 감정어가 아니라 화면에 보이는 행동으로 적었다.
- [ ] Environment에 장소·시간·조명이 포함되어 있다.
- [ ] Camera에 샷 크기와 카메라 무브먼트 1개가 포함되어 있다.
- [ ] Style은 하나의 영상 톤으로 통일되어 있다.
- [ ] Constraints에 얼굴 변형 금지, jitter 금지, 자막·워터마크 금지가 포함되어 있다.
- [ ] 영상 길이와 화면비를 지정했다.
- [ ] 카메라 움직임과 피사체 움직임을 분리해서 서술했다.
- [ ] `fast`를 사용하지 않았다.

### 금기 점검 체크리스트

- [ ] 상충하는 카메라 지시를 한 샷에 함께 넣지 않았다.
- [ ] `24fps`, `f/2.8`, `ISO 800` 같은 기술 스펙 표기를 넣지 않았다.
- [ ] `fast` 키워드를 넣지 않았다.
- [ ] 카메라, 동작, 스타일, 제약 등 다수 변수를 동시에 변경하지 않았다.

## 4. 카메라 문법·금기

Seedance 2.0 프롬프트에서 카메라는 품질과 일관성에 큰 영향을 준다. 카메라 지시는 “기술 사양”이 아니라 “촬영 리듬”으로 써야 한다.

### 권장 카메라 용어

- dolly in / push-in: 피사체 쪽으로 천천히 접근한다.
- dolly out / pull-out: 피사체에서 멀어지며 공간을 드러낸다.
- pan: 카메라가 좌우로 회전한다.
- tilt: 카메라가 위아래로 회전한다.
- tracking shot: 피사체를 따라 이동한다.
- rack focus: 초점을 전경에서 배경, 또는 배경에서 전경으로 이동한다.
- crane up: 카메라가 위로 상승하며 스케일을 드러낸다.
- arc shot / orbit: 피사체 주변을 호 형태로 돈다.

### 규칙

- 한 샷에는 카메라 움직임을 하나만 둔다.
- 카메라 움직임과 피사체 움직임을 분리해서 쓴다.
- `slow`, `smooth`, `stable`, `gradual`, `gentle`, `controlled`처럼 리듬을 나타내는 단어를 사용한다.
- `24fps`, `f/2.8`, `ISO 800` 같은 기술 스펙은 피한다.
- 렌즈는 정확한 장비값보다 `wide lens feel`, `normal lens feel`, `telephoto portrait feel`, `macro lens feel`처럼 느낌으로 쓴다.
- `fast`는 품질 저하 1순위 위험 키워드로 취급한다. 빠른 피사체, 빠른 카메라, 복잡한 배경을 동시에 요구하지 않는다.

### 나쁜 예와 수정

나쁜 예:

```text
Camera pushes in, pans left, tilts up, orbits around the model, then zooms fast.
```

수정:

```text
Medium close-up, camera slowly pushes in while the model turns her head gently.
```

## 5. 멀티샷/타임라인 규칙

Seedance 2.0은 단일 프롬프트에서 여러 장면 흐름을 줄 수 있지만, 너무 촘촘한 타임코드나 복잡한 컷 지시는 흔들림을 만든다.

### 타임라인 방식

5–8초 클립은 2–3개의 비트로 충분하다.

```text
[0s] 시작 구도: 피사체, 장소, 조명, 첫 동작.
[3s] 주요 변화: 동작의 중심, 카메라의 단일 움직임.
[6s] 종료 상태: 최종 포즈, 제품/인물 히어로 프레임, 카메라 정착.
```

규칙:

- `[0s]`, `[3s]`, `[6s]`는 정확한 프레임 명령이 아니라 서사적 앵커로 사용한다.
- 각 시간 블록은 3–5개 지시만 포함한다.
- 연속 원테이크가 필요하면 `single continuous shot, no cuts, no sudden scene change`를 붙인다.
- 컷 전환이 필요하면 `Shot 1`, `Shot 2`, `Shot 3` 구조가 더 명확하다.
- 12컷급 서사 시퀀스는 단일 프롬프트로 만들지 않는다 — `core/prompts/storyboard.md`의 파이프라인(캐릭터 시트 → 스토리보드 → 컷별 클립 변환)을 선행한다.

### Scene/Shot 방식

```text
Shot 1: Wide shot, product and environment are established.
Shot 2: Medium close-up, the person interacts with the product.
Shot 3: Close-up hero frame, final expression and product detail are held.
```

멀티샷에서도 인물, 의상, 제품, 조명, 무드를 반복해 고정한다. 샷마다 완전히 새로운 스타일을 주지 않는다.

## 6. 인물 고정(@태그+제약문)

참조 파일이 있을 때는 `@Image`, `@Video`, `@Audio`의 용도를 명확히 분리한다. “참조를 사용하라”보다 “무엇을 참조하고 무엇은 참조하지 말라”가 중요하다.

### @태그 운용

- `@Image 1`: 얼굴, 헤어, 의상, 체형, 제품 외형 등 정체성 참조.
- `@Image 2`: 배경, 색감, 조명, 인테리어 참조.
- `@Video 1`: 카메라 무브먼트, 보행 리듬, 포즈 변화, 컷 리듬 참조.
- `@Audio 1`: 대사, 발화 속도, 감정, 호흡, 음악 비트, 환경음 참조.

참조는 1–12개 파일 범위에서 관리하되, 많을수록 충돌 가능성이 커진다. 각 참조의 역할을 첫 문단에 선언한다.

### 인물 고정 제약문

```text
Use @Image 1 as the strict identity reference. Preserve the same face, hairstyle, skin tone, body proportions, outfit, and expression style throughout the entire video. Do not copy the identity from @Video 1; use @Video 1 only for camera movement and action rhythm.
```

립싱크가 있으면 다음을 추가한다.

```text
Use @Audio 1 as the exact spoken dialogue. Match mouth shapes, syllables, pauses, breathing, and emotion to @Audio 1. Do not invent new words or replace the voice.
```

### 영상용 참조 이미지 설계 (첫 프레임)

`@Image` 참조를 gpt-image-2/nano-banana-pro로 새로 만들 때, 정지 사진이 아니라 **움직이는 장면의 한 순간**으로 설계해야 영상화 시 끊김이 없다(2026-07-08 수집, 공개 크리에이터 실무 공식).

- 필수 5요소: ① 용도 명시(문두: 영상용 프레임임을 선언) ② 타임라인 위치(몇 번째 프레임/비트인지) ③ 동적 포즈 — 동작의 "중간" 순간(`moment when` + 진행형 동사) ④ 카메라 궤적 예고(이후 tracking/dolly 방향) ⑤ 다음 프레임 힌트(연속성 단서: 시선·무게중심·옷자락 방향).
- 공식: `[용도] frame #[번호], moment when [주체] [동작 중간], [카메라 궤적], [환경 움직임], [조명/무드], [스타일], production ready`
- 예: 걷다가 멈춘 자세가 아니라 "왼발이 지면에 닿기 직전, 스커트 자락이 진행 방향 뒤로 흐르는 순간"처럼 힘과 방향이 남아 있는 프레임을 지시한다.

## 7. 필수 제약/네거티브 묶음

프롬프트 끝에는 장면별 제약을 3–7개로 좁혀 붙인다. 모든 금지를 한 번에 쌓으면 이미지가 둔해질 수 있으므로, 인물·제품·카메라 안정성에 직접 관련된 것만 우선한다.

### 인물 영상 기본 묶음

```text
Avoid jitter and bent limbs. Character face stable without deformation, normal human structure. Natural hands with five fingers, no extra limbs, no warped mouth, no distorted teeth. No identity drift, no outfit change, no flickering.
```

### 품질 스위치

```text
sharp clarity, high detail, stable picture, clean motion, natural lighting, no blur, no ghosting, no flickering, no subtitles, no logo, no watermark.
```

### 제품/마케팅 영상 묶음

```text
Keep product shape, label placement, material, color, and proportions stable. Avoid product deformation, unreadable text, wrong logo, extra objects, warped hands, background collapse, motion blur, flicker.
```

### 물리와 오디오

- 물리: 마찰, 무게, 접촉, 관성, 천의 장력, 액체 점도, 발걸음 압력처럼 실제 힘을 서술하면 모션 품질이 좋아진다.
- 오디오: `soft room reverb`, `muffled street ambience`, `subtle footsteps`, `fabric rustle`, `gentle product click`처럼 사운드 질감을 쓰면 네이티브 사운드 생성이 더 명확해진다.

## 8. 예시 프롬프트 1개: 인물 마케팅 영상

아래 예시는 인물 정체성, 오디오 립싱크, 단일 카메라 움직임, 품질/네거티브 제약을 포함한 60–100단어형 프롬프트다.

```text
Use @Image 1 as strict face and outfit reference for the female skincare founder. A confident woman in a cream blazer holds a serum bottle and smiles softly while saying one short line from @Audio 1. She stands in a warm minimalist bathroom with morning window light and soft room reverb. Medium close-up, camera slowly pushes in, normal lens feel. Premium beauty marketing style, natural skin texture, sharp clarity, high detail. Preserve face, clothing, product shape, and lip sync. Avoid jitter and bent limbs, face deformation, blur, ghosting, flickering, subtitles, logos, watermark.
```

## 9. 근거 링크+수집일

수집일: 2026-07-07

- BytePlus ModelArk, Dreamina Seedance 2.0 series prompt guide: https://docs.byteplus.com/api/docs/ModelArk/2222480
- BytePlus ModelArk, Dreamina Seedance 2.0 series tutorial: https://docs.byteplus.com/en/docs/ModelArk/2291680
- ByteDance Seedance 2.0 공식 소개: https://seed.bytedance.com/en/seedance2_0
- Seedance 2.0 Model Card(arXiv): https://arxiv.org/abs/2604.14148
- APIYI Seedance 2.0 prompt guide 해설: https://help.apiyi.com/en/seedance-2-0-prompt-guide-video-generation-camera-style-tips-en.html
- WaveSpeed Seedance 2.0 prompt template: https://wavespeed.ai/blog/posts/blog-seedance-2-0-prompt-template
- WeShop/Seedance 2.0 참조·오디오·립싱크 프롬프트 자료: https://www.weshop.ai/

검증 메모: 공식 BytePlus 문서는 2026-07-07 기준 페이지 존재와 갱신일을 확인했다. 공개 공식 자료에서 멀티모달 오디오-비디오 생성은 확인되나, “8언어+ 립싱크”의 구체 언어 목록은 공식 공개 문서에서 별도 확인하지 못했으므로 운영 전 실제 모델 테스트가 필요하다.
