# 캔디드 스마트폰 리얼리즘 문법 (candid realism)

수집일: 2026-07-08(1차 4건, 2차 로그인 세션 수확으로 총 35건). 출처: Threads @reactor_art 공개 프롬프트. 공개 게시된 프롬프트를 기법 축으로 분해한 연구 노트이며, 원문 프롬프트를 그대로 재배포하는 자료가 아니다(원문 코퍼스: workspace/reports/2026-07-08-reactor-art-harvest.md). 작성자 운용 정보(실측): 생성기는 GPT Image와 Gemini를 병용하며 다수 프롬프트 말미의 `n=6. 9:16@이미지 만들기`가 ChatGPT 이미지 만들기 툴 사용을 실증한다(장당 6변형 배치 생성 후 선별 게시 추정). 인물 일관성은 캐릭터 단독 컷 + 캐릭터 시트 그리드의 이중 첨부로 확보하고, 게시물별 인물 차이는 인물별 시트 교체로 만든다(이중 첨부 레시피는 core/prompts/turnaround-sheet.md 5절에 반영). 한국어 원문 프롬프트도 동급 밀도로 운용되어 gpt-image-2 한국어 자연문형 노선을 뒷받침한다.

골든셋의 에디토리얼·브랜드 화보 문법과 구별되는 별도 레지스터다. 목표가 "잘 찍은 사진"이 아니라 **"AI로 안 보이는, 우연히 찍힌 사진"**일 때 이 문법을 쓴다.

## 1. 핵심 원리 — 의도적 불완전성

에디토리얼 문법이 구도·조명·재질을 정밀 지정해 완성도를 올리는 반면, 이 문법은 **불완전성 자체를 지시 대상으로 만든다**. 완성도 지시를 빼는 것이 아니라, 불완전성을 정밀하게 지시한다.

## 2. 기법 축

### 2.1 촬영 기기 서명 (device signature)
- 기기와 촬영 방식을 명시: `handheld smartphone shot`, `phone front camera`, `shot on smartphone main camera, 24-35mm equivalent`
- 기기 고유 아티팩트를 긍정 지시: `phone HDR selfie texture`, `mild compression traces`, `subtle grain`, `natural digital noise`, `slight sharpening`
- 효과: 스튜디오 사진 프라이어를 차단하고 폰 카메라 파이프라인의 질감을 재현

### 2.2 불완전 구도 (imperfect framing)
- `slightly off-center composition`, `imperfect crop`, `casual imperfect candid framing`, `natural crop`
- 전경 신체 일부로 프레임을 자르는 기법: 팔뚝이 전경에 크게 걸리는 `strong cropped vertical shape`
- "주제 없음" 선언: `no clear subject or specific composition, just a random, unintentional shot`

### 2.3 모션·초점 열화 (motion and focus degradation)
- `mild motion blur`, `slightly blurred from motion`, `a small amount of focus softness`
- 에디토리얼 문법의 "선명하게"와 정반대 방향의 정밀 지시

### 2.4 불균일 조명 (uneven lighting)
- `soft, uneven natural light with slightly underexposed areas`, `patchy shadows`(창틀·식물 통과광), `evenly lit by street lights`
- 금지형으로 스튜디오 신호 차단: `no studio lighting`, `no beauty-dish effect`, `no commercial polish`, `no flash`

### 2.5 자연 오클루전 (natural occlusion)
- 바람에 날린 머리카락이 얼굴을 부분 가림: `wind blows thin strands across her cheek, eyes, and near her lips, partially obscuring the face`
- `realistic hair obstruction` — 완벽한 얼굴 노출을 깨서 후보정 프라이어를 차단

### 2.6 순간성 서사 (moment narrative)
- 장면을 "찍힌 순간"으로 서술: `as if casually photographed when sunlight entered the room`, `as if she just turned back after being called`
- 무드 문장에 비연출 선언 포함: `not staged or posed`, `Not a polished studio portrait`

### 2.7 안티 AI 네거티브 스택 (anti-AI negative stack)
- 공통 금지 목록: `plastic skin, over-retouching, hyper-sharp details, artificial bokeh, perfect symmetry, glamour posing, obvious AI look, exaggerated proportions, bad anatomy, extra limbs, overexposed highlights`
- 골든셋 금지 문법과 결이 같으나 `perfect symmetry`, `artificial bokeh` 등 "너무 잘 만들어진 신호"를 금지 대상에 추가하는 점이 다르다

### 2.8 필름 스톡·카메라 시그니처 (film and camera signature)
- 필름 에뮬레이션을 색보정 약칭으로 사용: `Fujifilm Classic Negative look, desaturated cool tones, punchy highlights`, `Kodak Portra 400, ~5500K daylight, muted grade, subtle grain`
- 노출 삼각형을 명시해 렌더 물리를 고정: `16mm ultra-wide, f/8, 1/125s`, `35mm at f/11, 1/1000s, ISO 100`(전심도 강제), `f/2.0, 1/60s, ISO 800`(실내 셀카)
- 구세대 센서 룩: `CCD soft-focus texture, dreamy haze, highlight bloom, halo glow`, `as if captured on a 1990s–early 2000s consumer film camera`, `like a real analog snapshot scanned from film`
- 기종 명시는 룩 프리셋처럼 동작: `shot on an iPhone 17`, `Sony A7R V`, `Canon EOS R5`

### 2.9 다이렉트 플래시 스냅 (direct flash snap)
- 온카메라 플래시의 물리를 서술: `direct on-camera flash sharply lights her face and nearby asphalt texture, creating specular highlights on skin, deep shadows beneath her, and rapid falloff into darkness`
- 플래시가 드러내는 재질을 긍정 지시: `flash reveals raised wall texture, real clothing wrinkles, slight asymmetry, edge vignetting`
- 검은 원단의 흡광 대비: `while black fabric absorbs light into deep shadows` — 야간 SNS 스냅 레지스터의 핵심 광학

### 2.10 강제 원근·전경 지배 (forced perspective)
- 초광각 + 극단 앵글로 프레임 위계를 만든다: `extreme top-down diagonal perspective where her head dominates the right side of the frame`, `strong low-angle from near ground level, wide smartphone lens distortion`
- 전경 신체부 점유율을 수치로 지시: `huge foreground hand occupying 30–50% of the frame, palm facing camera, five natural fingers`
- 왜곡을 결함이 아닌 에너지로 선언: `intense distorted perspective, raw candid energy`

### 2.11 피부 마이크로리얼리즘 어휘 (skin micro-realism vocabulary)
- 최고밀도 피부 지시 세트: `visible pores and vellus hair, subsurface scattering on ears and nose, oil sheen limited to the T-zone, texture-preserving retouch`
- 캐치라이트를 광원과 논리적으로 결속: `one catchlight in both eyes matching the window`, `a single consistent catchlight in both eyes`
- 재질 반사의 물리 서술: `soft anisotropic highlight bands running along the grain, a faint reflection of the backdrop, not a blown-out mirror sheen`
- 이 어휘는 캔디드뿐 아니라 에디토리얼 레지스터에도 이식 가능 — 골든셋 재질 지시의 상위 호환 후보

### 2.12 노출·연령 안전 통제 (exposure and age control)
- 성인 명시를 긍정+부정 양방향으로: `an adult woman in her late 20s, elegant and mature, with no youthful or underage impression`, 네거티브에 `minor-looking subject`
- 노출 범위를 열거형으로 통제: `Visible skin includes face, neck, collarbones, …; back and buttocks are not visible`, `waist and hips remain covered`, `chest fully covered`
- 톤 통제 네거티브: `oversexualized pose, vulgar exposure` — 리얼리즘 강도를 올릴수록 이 축을 함께 올린다

### 2.13 분할 게시 관행 (참고)
- 출처 계정은 스레드 글자수 제한 때문에 긴 프롬프트를 장면·구도 / 의상·재질 / 포즈·표정·피부 / 카메라·조명·네거티브 순의 답글 4개로 분할 게시한다. 이 절단선 자체가 프롬프트의 모듈 구조를 드러내며, shot-spec 축 분해와 일치한다. 수집 시 분할분 병합이 필수다.

### 2.14 에디토리얼 스튜디오 리얼리즘 (탈채도+골격 조명 레지스터)
- 수집: 2026-07-08, Instagram @ore_archive_ 배포 "하이패션 에디토리얼 프롬프트 사용설명서 2026"(공개 배포 PDF, 기법 분해 연구 노트 — 원문 재배포 아님, 활용 시 출처 표기 요청 있음). 결과물이 실사 판독 급으로 확인된 실전 프리셋.
- 핵심 원리: 이 문서의 캔디드 축(불완전성 지시)과 **반대 방향에서 같은 목표**를 이룬다 — 스튜디오 완성도를 유지하면서 AI 티의 주범인 과채도 피부 발광·균일 소프트광·과잉 디테일을 **조합으로** 차단한다. 개별 요소는 기존 축(팔레트 저채도, 측면광, 2.11 피부, 2.8 그레인, 85mm)에 다 있으나 세트 결속이 레버다.
- 조합 4요소(세트로 지시): ① **탈채도 그레이딩** — `모노크롬에 가까운 절제된 색감` + 미세 필름 그레인. 채도를 죽이면 AI 특유의 피부 과발광·색 아티팩트가 시각적으로 소거된다. ② **하드 단일 측면광** — 한쪽에서 들어오는 드라마틱한 측면광으로 광대·턱·쇄골 골격에 음영. 균일 소프트광(AI 프라이어)을 정면으로 깬다. ③ **미니멀 의상 = 아티팩트 표면적 축소** — 블랙 슬리브리스/미니멀 이너웨어로 옷 텍스처·로고·패턴 등 왜곡 발생 지점 자체를 제거하고, 어깨·쇄골 실루엣으로 리얼리즘을 세운다. ④ **호리존 그레이 시임리스 + 85mm 얕은 심도** — 배경 정보를 0으로 만들어 아티팩트 검사 표면을 인물로 한정.
- 표정·포즈 어휘: `진짜 런웨이 모델 같은 또렷한 이목구비와 강한 포스, 절제된 표정` — 미소 클리셰 차단은 골든셋 010의 "caught the instant before a smile"과 동일 계열.
- 하네스 적용: 사용자가 "화보", "에디토리얼", "모델컷", "룩북 커버" 계열에 "AI티 제거"를 함께 요구하면 이 레지스터를 쓴다. 2.11 피부 어휘·2.12 노출 통제와 병용하고, 정체성 체인(시트 이중 첨부)을 얹으면 프리셋의 약점(매 생성 다른 얼굴)이 해소된다. 출처 프리셋은 변수 2개([국가]/[성별]) 단문형 — 재사용성 설계는 shot-spec 프리셋화의 참고 사례.

## 3. 하네스 적용 규칙

- 사용자가 "일상샷", "셀카", "막샷", "AI티 안 나게", "인스타 감성", "UGC 광고", "네이티브 광고" 계열을 요구하면 이 문법을 기본 레지스터로 선택한다. 제품이 등장하는 마케팅 컷이면 `core/prompts/persona-marketing.md` 4.2.1의 라벨 선명 유지 규칙을 함께 적용한다.
- shot-spec 축과 결합할 때: 구도 축은 2.2의 불완전 구도로, 조명 축은 2.4의 불균일 조명으로 치환하고, 재질·정체성 축(캐릭터 고정 블록, 피부 결)은 그대로 유지한다.
- 캐릭터 일관성 규칙(series-injection, 참조 역할 선언)과 충돌하지 않는다 — 정체성은 고정하되 촬영 품질만 열화시킨다.
- 순서 관행: 매체·비율 → 주체 → 외모 → 의상 → 노출 범위 → 배경 → 조명 → 카메라 → 무드 → 네거티브. 기존 shot-spec 순서와 동일 골격이므로 별도 순서 규칙을 추가하지 않는다.
- 생성기 실측(2026-07-08, A2 턴어라운드 → A3 캔디드 → A-test2 하이키 룩북 → A-test1 캔디드 v3, 4연속): 생성기 우위는 레지스터 조건부이며, 캔디드 레지스터의 gpt 열세는 **프롬프트 밀도로 극복 가능**함이 확인됐다. 기본 밀도 프롬프트(A3)에서는 nano-banana-pro(Gemini)가 질감·닮음 우위였으나, gpt 보정 레버 4종 — ① 2.8 필름 트리트먼트(35mm 그레인 얼굴 포함 전면 + 클린 디지털 룩 금지) ② 2.11 마이크로리얼리즘 피부(모공·솜털·피하산란·T존 유분광·결점 허용) ③ 미인화 역차단(입술·눈 확대 금지 + 미세 비대칭 유지 긍정 지시) ④ 포즈 강제 분화(변형별 포즈 명시 + 클리셰 포즈 금지) — 를 모두 적용한 v3(A-test1)에서는 gpt가 동급 이상으로 올라섰다. 라우팅: 클린 커머셜·룩북·규격 컷 = gpt 우선. 캔디드 = gpt로 갈 때 보정 레버 4종 필수 적용, 미적용 기본 밀도라면 nano 우선. 잔여 관찰: gpt는 레버 적용 후에도 입술 볼륨의 약한 드리프트가 남고, Gemini는 소품 세부 스펙(케이스·로고) 누락과 강제 AI 워터마크(마케팅 게시 전 크롭 필수)가 반복된다.
