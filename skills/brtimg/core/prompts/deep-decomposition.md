# 딥 디컴포지션 & 리슛 충실도 (deep-decomposition)

프롬프트를 "분위기 재현"이 아니라 **"이 컷을 이 컷이게 만드는 요소의 재현(reshoot brief)"** 수준으로 끌어올리는 문서다. sanguneo 공개 템플릿(2026-07-10 웨비나 · `image-prompt-template.json` 원출처)의 기법을 brtimg 하네스에 편입하되, **이미 `shot-spec`·`loop`·`checklist`가 다루는 축은 중복하지 않고 아래 5개 구멍만 보강한다.**

## 0. brtimg가 이미 하는 것 (중복 이식 금지)

| 영역 | 이미 있는 곳 |
|---|---|
| 프레임·카메라·렌즈·앵글·구도 축 | `shot-spec.md §3.1~3.2` |
| 조명 방향(시계 방위)·패턴·광질·색온도 | `shot-spec.md §3.5` |
| 포즈·시선·몸 방향 | `shot-spec.md §3.3` |
| 초점·심도·색·질감·마감·배경·네거티브 | `shot-spec.md §3.4~3.8` |
| 인물 identity 고정 | `checklist image-identity-anchors` + 캐릭터 시트 |
| 물리적 충돌·정합 점검 | `shot-spec.md §5` (8규칙) |
| 제너릭 표현 금지 | `checklist image-no-generic-language`, `loop.md §3.2-5` |
| 초안→비평→개선 자기검증 | `loop.md` |

## 1. Fidelity Anchors — identity를 넘어 "이 컷"으로 확장

brtimg의 `identity-anchors`는 **인물 얼굴**만 고정한다. 여기서는 그 개념을 **이미지 전체**로 넓힌다.

- **정의**: "이 이미지를 처음 설명할 때 사람들이 가장 먼저 꼽는 5~8개 요소"를 **랭킹**으로 명시한다. 얼굴뿐 아니라 헤어 실루엣·의상·소품·조명·구도까지 포함.
- **선정 기준**: 생성 결과가 그 앵커 하나라도 놓치면 "다른 컷"으로 읽히는 것 — 그걸 기준으로 고른다.
- **작성 시점**: **맨 마지막에** 작성한다(전체 분해가 끝나야 무엇이 정체성인지 보인다).
- **각 앵커는 §2 구체 앵커 규칙**으로 서술한다.
- **산출 반영**: 브리프와 `finalText` 앞부분에 앵커를 우선 배치해 드리프트를 막는다. (예: 데이지 인물 컷에서 `black off-shoulder + choker`가 fidelity anchor였다면 흰 스트랩 탑으로 흘러가지 않았을 것 — 이 문서가 생긴 이유.)

## 2. Anchor-per-field 룰 (필드당 구체 앵커 강제)

모든 서술 필드는 **숫자·각도·길이·시계방위·명명색·구체 사물명** 중 하나 이상을 담는다. 형용사는 그런 앵커와 짝지을 때만 허용한다. **무드어 단독 금지.**

- 예외: 감정 품질 필드(`expression.overall_impression`, `emotion_keywords`, `gaze.emotion`, `meta.mood`)는 순수 질적 서술 허용.
- 나쁜 예: "부드러운 조명". 좋은 예: "10시 방향 45도 위 소프트 키, 그림자측은 웜뉴트럴로 약 1/2스톱 폴오프".

## 3. Composition Map (공간 레이아웃 고정)

brtimg는 배치를 "선택지"로 주지만, 생성기가 레이아웃을 임의 발명하는 걸 막으려면 **공간을 못박아야** 한다. "분위기"가 아니라 **실제 사물명**으로 채운다 (불명확한 배경이 불충실 생성의 주원인).

- `frame_crop`: 프레임이 몸 어디를 자르는지 + 헤드룸 비율.
- `foreground / midground / background`: 각 층에 있는 실제 사물명.
- `left_third / center_third / right_third`: 세로 3분할 각 칸의 내용.
- `edge_contacts`: 각 프레임 엣지에 닿거나 잘리는 것.

## 4. 딥 필드 3종 (brtimg가 얕은 부분)

- **expression / gaze 세분** (캐릭터 시트·`appearance-catalog`로 흡수): 눈썹 텐션 · 눈꺼풀 개방 · 홍채 방향 · **양홍채 정렬(iris_alignment)** · **공막 노출비(sclera_visibility)** · 입 벌림 mm · 턱 텐션. → 사시·롤백 눈 방지.
- **skin_lighting_behavior** (조명축에 "피부 반응" 레이어 추가): 빛측/그림자측 **색온도 시프트**를 명시한다. "피부가 전체 동일색이면 안 됨 — 빛측은 광원색을 반영, 그림자측은 깊이·웜을 유지". 밝기만이 아니라 **색온도 변화**로 서술.
- **anatomy_and_proportion + avoid**: 머리:몸 비율(1/7~1/8), 목·어깨·손 비율. **포즈별 왜곡 avoid**를 붙인다(손이 보이면 손가락, 회전 포즈면 단축 왜곡). AI티 직격 레버.

## 5. 역분석 프로토콜 (이미지 → JSON · refine 강화)

`/brt:img-prmpt refine`에서 이미지를 프롬프트로 풀 때 이 3단계를 강제한다. 목표는 **리슛 브리프** — 사진가·스타일리스트·모델이 이 JSON만으로 재현하면 *같은 촬영의 다른 프레임*이 나와야 성공이고, "분위기·색만 비슷"은 **실패**다. 의심스러우면 **눈에 보이는 것을 그대로 서술하고, 더 예쁜 대안으로 치환하지 않는다.**

1. **INVENTORY**: 템플릿을 건드리기 전, 이미지에서 25~40개 팩트 관찰을 프레임 위치와 함께 메모한다 ("검정 니트 소매가 팔뚝 중간에서 끝남", "머리끝이 턱선에서 안으로 C컬"). 작업용 — 최종 출력에 넣지 않는다.
2. **FILL**: 인벤토리 항목만으로 템플릿을 채운다. 관찰로 추적 안 되는 필드는 추측하지 말고 이미지로 재확인한다.
3. **READ-BACK**: 완성 JSON만 다시 읽고 "이게 *이 이미지*를 재현하나, 그냥 비슷한 바이브인가?"를 묻는다. 비평가가 짚을 차이 5개를 나열하고 그 필드를 패치한 뒤, §6 교차필드 정합을 점검하고 최종화한다. 차이 목록은 작업용 — 출력 제외.

## 6. 교차필드 정합 점검 (loop.md 비평 패스에 편입)

모순되는 필드는 생성기가 **양쪽 다 무시**하게 만든다. 브리프 확정·READ-BACK 시 점검한다 (`shot-spec §5`의 물리적 충돌 규칙과 별개 — 이건 서술 간 모순):

- `expression.eye_direction` ↔ `gaze.direction` ↔ `pose.head_orientation`(yaw)
- `meta.aspect_ratio` ↔ `meta.orientation`
- `camera.shot_type` ↔ `composition_map.frame_crop`
- `scene.key_objects` ↔ `pose.spatial_relationships`

## 7. 딥 필드 템플릿과 최종 출력의 관계

전체 필드 구조는 `core/schema/image-prompt-template.json`을 참조한다. 통짜 자유텍스트 대신 필드로 분해하면 "한 부분만 교체"가 쉽고 생성기가 덜 헷갈린다.

**단, 최종 `finalText`는 여전히 자연문으로 조립한다**(`loop.md §7` 위생 규칙). 딥 필드는 **브리프·설계 단계의 작업 구조**이고, 산출 형식은 생성기별 규약(`core/generators/*.md`)을 따른다. 즉 딥 디컴포지션은 "무엇을 고정할지"를 촘촘하게 잡는 도구이지, 최종 프롬프트를 필드 나열로 내보내라는 뜻이 아니다.
