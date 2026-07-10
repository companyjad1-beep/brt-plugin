# Seedance 2.0 리서치 출처 목록

수집일: 2026-07-07  
대상 파일: `core/generators/seedance-2.md`

## 1. 1차/공식 계열 출처

| 출처 | 링크 | 확인한 내용 | 메모 |
| --- | --- | --- | --- |
| BytePlus ModelArk, Dreamina Seedance 2.0 series prompt guide | https://docs.byteplus.com/api/docs/ModelArk/2222480 | 공식 프롬프트 가이드 페이지 존재, 2026-07-07 갱신일 | 페이지 본문 일부는 JS 기반이라 전문 추출이 제한됨 |
| BytePlus ModelArk, Dreamina Seedance 2.0 series tutorial | https://docs.byteplus.com/en/docs/ModelArk/2291680 | 공식 튜토리얼 페이지 존재, 2026-07-07 갱신일 | ModelArk 비디오 생성 문서 내 Seedance 2.0 튜토리얼 |
| ByteDance Seedance 2.0 공식 소개 | https://seed.bytedance.com/en/seedance2_0 | 통합 멀티모달 오디오-비디오 생성 구조, 텍스트·이미지·오디오·비디오 입력 | 공식 제품 소개 성격 |
| Seedance 2.0 Model Card(arXiv) | https://arxiv.org/abs/2604.14148 | 네이티브 멀티모달 오디오-비디오 생성, 4–15초 클립, 텍스트·이미지·오디오·비디오 입력 | 모델카드/기술 근거 |

## 2. 실무 프롬프트 해설 출처

| 출처 | 링크 | 반영한 내용 | 주의점 |
| --- | --- | --- | --- |
| APIYI Seedance 2.0 prompt guide | https://help.apiyi.com/en/seedance-2-0-prompt-guide-video-generation-camera-style-tips-en.html | 6단계 공식(Subject → Action → Environment → Camera → Style → Constraints), 60–100단어, 카메라와 피사체 움직임 분리, 한 번에 하나의 카메라 지시, `fast` 위험, 네거티브 프롬프트 | 공식 가이드 해설/운용 문서 |
| WaveSpeed Seedance 2.0 prompt template | https://wavespeed.ai/blog/posts/blog-seedance-2-0-prompt-template | Subject/Action/Camera/Style/Constraints 템플릿, 짧고 구조화된 프롬프트, 한 샷 한 카메라 무브, 네거티브 체크리스트, 한 변수씩 재프롬프트 | 플랫폼 실무 블로그 |
| WeShop AI Seedance 2.0 자료 | https://www.weshop.ai/ | `@Image`, `@Video`, `@Audio` 참조 역할 분리, 제품/패션/립싱크/네이티브 오디오 프롬프트 구조 | 2차 근거 — 보수적 가정으로 취급, 공식 확인 전까지 강한 주장 금지. 세부 페이지 URL은 운영 전 재확인 필요 |
| MindStudio 계열 타임라인 프롬프팅 자료 | https://mindstudio.ai/ | `[0s]`, `[3s]`, `[6s]`식 타임라인 비트, 짧은 클립에 2–3개 앵커 사용, 시작/중간/종료 상태 지정 | 2차 근거 — 보수적 가정으로 취급, 공식 확인 전까지 강한 주장 금지. 직접 페이지 전문은 안정적으로 추출하지 못함 |

## 3. 신뢰도 등급 표

| 등급 | 출처/항목 | 문서 적용 기준 |
| --- | --- | --- |
| 공식 | BytePlus ModelArk 문서, ByteDance Seedance 2.0 공식 소개, Seedance 2.0 Model Card | 모델 입력, 멀티모달 오디오-비디오 생성, 4–15초 클립처럼 공식·모델카드에서 확인되는 범위만 강한 주장으로 사용 |
| 준공식/플랫폼 실무 | APIYI, WaveSpeed 등 플랫폼 실무 해설 | 6단계 템플릿, 카메라 분리, `fast` 회피, 네거티브 체크리스트처럼 복수 실무 자료가 일치하는 운용 규칙으로 사용 |
| 커뮤니티/2차 근거 | WeShop, MindStudio, 사용자 제공 리서치 요약 기반 주장 | 참조 역할, 타임라인 앵커, 물리 서술 효과, 오디오 키워드, 8언어 립싱크 등은 보수적 가정으로 취급하고 공식 확인 전까지 강한 주장 금지 |

## 4. 반영한 핵심 주장과 근거 상태

| 주장 | 근거 상태 | 적용 위치 |
| --- | --- | --- |
| Seedance 2.0은 텍스트·이미지·비디오·오디오 입력을 쓰는 멀티모달 오디오-비디오 생성 모델이다 | 공식/모델카드 계열 자료로 확인 | 개요/스펙 |
| 프롬프트는 Subject → Action → Environment → Camera → Style → Constraints 순서가 안정적이다 | APIYI, WaveSpeed, 공식 가이드 요약과 일치 | 6단계 템플릿 |
| 카메라는 한 샷에 한 움직임만 쓰고, 피사체 움직임과 분리해야 한다 | APIYI, WaveSpeed 공통 권장 | 카메라 문법·금기 |
| `slow`, `smooth`, `stable`, `gradual` 같은 리듬어가 유효하며 `24fps`, `f/2.8` 같은 스펙형 지시는 피한다 | APIYI 해설 | 카메라 문법·금기 |
| `fast`는 품질 저하 위험 키워드다 | APIYI 해설 및 현장 메모 | 카메라 문법·금기 |
| 멀티샷은 Shot 1/2/3 또는 `[0s]`, `[3s]`, `[6s]` 타임라인으로 구조화한다 | 2차 근거 — MindStudio/WeShop 계열 자료와 사용자 제공 요약. 보수적 가정으로 취급, 공식 확인 전까지 강한 주장 금지 | 멀티샷/타임라인 규칙 |
| 참조 파일은 역할을 명확히 선언해야 한다 | 2차 근거 — WeShop 계열 자료와 사용자 제공 요약. 보수적 가정으로 취급, 공식 확인 전까지 강한 주장 금지 | 인물 고정 |
| 네거티브에는 jitter, bent limbs, face deformation, blur, ghosting, flickering 등을 포함한다 | APIYI, WaveSpeed, WeShop 계열 자료. WeShop 기반 세부 주장은 2차 근거로 취급 | 필수 제약/네거티브 묶음 |
| 마찰, 무게, 접촉 등 물리 서술과 reverb, muffled 등 오디오 질감이 도움이 된다 | 2차 근거 — 사용자 제공 리서치 요약과 오디오-비디오 생성 자료. 보수적 가정으로 취급, 공식 확인 전까지 강한 주장 금지 | 필수 제약/네거티브 묶음 |
| 8언어+ 립싱크 | 2차 근거 — 사용자 제공 리서치 요약에는 포함되나 공식 공개 문서에서 언어 목록은 확인하지 못함. 보수적 가정으로 취급, 공식 확인 전까지 강한 주장 금지 | 개요/스펙에 검증 메모 포함 |

## 5. 운영 메모

- 이 출처 파일은 프롬프트 작성 근거를 보존하기 위한 문서이며, 실제 생성 품질은 모델 버전, 플랫폼 래퍼, 참조 파일 품질, 길이/비율 설정에 따라 달라질 수 있다.
- 공식 문서 전문 접근이 제한되는 경우가 있어, 운영 전 BytePlus/ByteDance 문서의 최신 본문과 각 플랫폼의 파라미터 제한을 다시 확인해야 한다.
- API 키 방식 독립 앱 설계는 이 범위의 목표가 아니다. 본 자료는 core 프롬프트 라이브러리용 가이드로만 사용한다.
