# 마케팅 플레이트 — 무인 배경·개념 슬라이드 (store-shots 배경 register)

store-shots 5단계의 codex 배경·개념 슬라이드 전용 레지스터. 디바이스(실캡처)나 렌더러 카피 **뒤에 깔리는** 무인 스틸·라이프스타일·환경 플레이트를 골든셋 밀도로 만든다. 인물 브랜드-히어로형은 `persona-marketing.md`를 병용한다.

## 1. 언제 쓰나

- 소품·사진급 연출(책상 위 소품, 도시 야경, 아늑한 식탁, 라이프스타일 신)일 때만. 미니멀 단색·그라데이션 무드는 절차적 렌더(`glow` + `decor_style: stars`)가 대비·재현성에서 우월하다(store-shots PATTERNS 배경 소스 결정 규칙).
- 개념 슬라이드(앱 화면 없이 포인트 자체를 이미지로)도 이 레지스터. 단 세트에는 실제 UI 캡처가 최소 1장 있어야 한다(스토어 규격).

## 2. 골든 기준 상속

플레이트도 "예쁜 배경"이 아니라 **사진**이다. `shot-spec.md` 축(프레임·카메라·조명·색/질감·배경·네거티브)과 `candid-realism.md` 2.8 필름 그레인·2.11 재질 마이크로리얼을 그대로 상속한다. 차이는 하나 — **인물·텍스트·UI가 없고, "합성 여백"이 설계 대상**이라는 점이다.

## 3. 합성 세이프 컴포지션 맵 (이 레지스터의 핵심 레버)

배경 위에는 반드시 뭔가 얹힌다. 그 자리를 비워서 설계한다.

- **디바이스 세이프 존**: 캔버스 중앙~하단에 스크린샷 디바이스가 합성된다고 가정한다. 그 구역은 저디테일·저대비 뉴트럴 필드로 두고, 주 소품·디테일은 프레임 가장자리·상단·바닥 코너로 민다(디바이스가 주 피사체를 가리지 않게).
- **카피 세이프 밴드**: 카피 슬롯(기본 상단 1/3)은 low-detail 저대비 여백 — 하늘·벽·보케·그라데이션 필드로 비운다. `overlay` 0.35~0.5가 얹혀도 텍스트가 읽히도록 명도를 한 방향으로 눌러 안정시킨다(밝은 밴드+밝은 카피, 어두운 밴드+어두운 카피 충돌 금지).
- **세로 비율 고정**: 타겟 규격(9:16·4:5·스토어 세로 등)에 맞춘 vertical. 가로 소스로 세로 프레임을 못 채우면 재생성한다.

## 4. 팔레트·조명·재질 앵커

- **브랜드 hex 명시**: 앱 테마·스플래시에서 추출한 주색+보조색을 팔레트에 박는다. 배경이 앱 화면과 한 색 패밀리여야 세트가 갈라지지 않는다.
- **광원·색온도·질감으로 사진급 고정**: 광원 방향·색온도(3200K 웜~7000K 쿨)·광질, 필름 그레인, 재질 마이크로리얼(반사·서브서피스·질감)을 구체값으로. 무드어 단독("아늑한","감성적인") 금지.
- **무드 = 마케팅 포인트 결속**: 배경 콘셉트는 그 컷의 포인트를 시각화한다(가계부 저녁 정산 = 웜 텅스텐 식탁, 감정일기 밤 = 딥 인디고 달빛). 장면이 포인트를 배신하면 예쁜 무드필름일 뿐이다.

## 5. 하드 제약 (네거티브에 필수 명시)

- `no people` (인물 브랜드-히어로형이면 예외 — `persona-marketing.md` 병용)
- `no text, no letters, no numbers, no logos, no signage, no UI, no phone screen, no app interface, no watermark`
- 브랜드·타사 자산, 앱 화면 위조·재구성 금지(스토어 리젝 사유)
- 디바이스 세이프 존·카피 세이프 밴드에 고대비 디테일 침범 금지

## 6. 충실도 앵커

플레이트도 5~8개 앵커를 랭킹으로 잡는다(무드어 단독 금지): 주 소품·환경 요소, 광질, 색온도, 주 재질, 여백 위치를 구체값(숫자·각도·명명색·hex)으로 브리프·finalText 앞에 배치한다.

## 7. 게이트 (생성 전 필수)

codex 실행 **전에** `core/checklists/image.checklist.yaml`로 자가채점한다(`eval/self-score.md` 규약). 적용 항목이 전부 `충족`일 때만 생성한다.

- **적용**: 피사체 특정(=주 소품·환경) · 장면 맥락 · 구도와 카메라 · 조명 · 스타일과 매체 · 하드 제약 · 비제너릭 · 산출 범위 닫힘 · 충실도 앵커 · 공간 레이아웃(컴포지션 맵).
- **제외(조건 미해당, 제외 기록에 사유)**: 인물 일관성 · 이미지 내 텍스트(오히려 금지) · 참조 역할 · 편집 · 마케팅 레이아웃(무인 플레이트엔 제품 라벨·로고가 없음).
- 생성 후 `read` 멀티모달 재검증(글자 아티팩트·왜곡·세이프 존 확보·hex 조화)은 게이트가 아니라 사후 확인이다. 미달이면 프롬프트를 수정해 재생성(최대 3회), 그래도 미달이면 그라데이션 폴백.

## 8. 골든 밀도 예시 (지도 앱 — 항공뷰 도시 보케 배경)

```text
A vertical aerial dusk photograph looking down at a dense city at blue hour, shot on a full-frame camera with a 50mm lens from rooftop height, deep tilt-shift so only a diagonal band of streets holds focus while the rest melts into round bokeh. Warm sodium streetlights and cool window glows read as soft circular lights scattered across the lower two-thirds; palette locked to the brand — deep indigo #1E2A4A base, teal #2DD4BF accents in the light pools, warm amber #F59E0B streetlamps, nothing else enters the palette. The upper third holds clean low-detail sky, indigo fading to near-black, an even unbroken field kept dark and low-contrast so overlaid copy stays legible. The lower-center stays a soft evenly-lit neutral cluster of blurred light with no sharp landmark, leaving room for a device to sit on top without covering any focal detail. Fine film grain, real optical bokeh with slight anamorphic ovals, subtle lens vignette, natural highlight roll-off. No people, no text, no letters, no numbers, no logos, no signage, no UI, no phone screen, no watermark, no legible building names, no oversharpening.
```
