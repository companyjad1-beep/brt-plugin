# Nano Banana Pro 공식/준공식 가이드 출처

수집일: 2026-07-07

## 출처 목록

| 구분 | 출처 | 링크 | 신뢰도 평가 |
| --- | --- | --- | --- |
| 공식 | Google Cloud Blog, “Ultimate prompting guide for Nano Banana” | https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-nano-banana | 공식. Google Cloud 제품 블로그이며 Nano Banana 2/Pro의 스펙, 프롬프트 프레임워크, 텍스트 렌더링, 다중 참조, 조명·카메라 제어의 1차 근거로 사용한다. |
| 공식 | Google Blog, “7 tips to get the most out of Nano Banana Pro” | https://blog.google/products-and-platforms/products/gemini/prompting-tips-nano-banana-pro/ | 공식. Gemini 제품 블로그이며 Nano Banana Pro의 Subject/Composition/Action/Location/Style 구조, 참조 입력 역할 지정, 텍스트·브랜드·캐릭터 일관성 지침의 근거로 사용한다. |
| 공식 | Vertex AI Gemini 3 Pro Image 문서 | https://docs.cloud.google.com/vertex-ai/generative-ai/docs/models/gemini/3-pro-image | 공식. 모델 스펙 확인용 기준 링크로 사용한다. |
| 커뮤니티/플랫폼 가이드 | fal.ai, “Nano Banana Pro Prompting Guide” | https://fal.ai/learn/tools/nano-banana-pro-prompting-guide | 커뮤니티/플랫폼. 참조 이미지 역할 지정, identity lock, 하드 네거티브, 부분 수정 전략의 실무 보조 근거로 사용한다. |
| 커뮤니티/플랫폼 문서 | fal.ai, “Nano Banana Pro API reference” | https://fal.ai/docs/model-api-reference/image-generation-api/nano-banana-pro | 커뮤니티/플랫폼. 파라미터와 편집 입력 구조 참고용이며 이 프로젝트의 API 키 기반 구현 근거로는 사용하지 않는다. |

## 핵심 인용

### Google Cloud Blog

- Nano Banana Pro는 Gemini 3 Pro Image로, 입력 컨텍스트 65,536 토큰과 1K/2K/4K 출력을 지원한다.
- 지원 비율은 1:1, 3:2, 2:3, 3:4, 4:3, 4:5, 5:4, 9:16, 16:9, 21:9이다.
- 참조 이미지는 한 프롬프트에서 최대 14개까지 혼합할 수 있다.
- “A simple list of keywords won't cut it; you need to describe the scene narratively.” 즉, 단순 키워드 목록보다 장면을 서술형으로 지시해야 한다.
- 텍스트-이미지 생성 공식은 `[Subject] + [Action] + [Location/context] + [Composition] + [Style]`이다.
- 편집은 바뀌는 것과 그대로 유지할 것을 분리해야 하며, 유지 조건을 명확히 쓰는 것이 중요하다.
- 텍스트 렌더링은 따옴표 사용, 폰트/스타일 지정, 번역·현지화 요구를 명확히 하는 방식이 권장된다.
- 카메라, 렌즈, 조명, 컬러 그레이딩, 재질·텍스처를 크리에이티브 디렉터처럼 지시하라는 지침이 있다.

### Google Blog

- 전문적인 결과를 위해 Subject, Composition, Action, Location, Style을 프롬프트에 포함하라고 권장한다.
- 고급 요소로 종횡비, 카메라와 조명 디테일, 특정 텍스트 통합, 사실 제약, 참조 입력 역할 지정을 제시한다.
- 참조 이미지를 사용할 때 “Image A는 포즈, Image B는 아트 스타일, Image C는 배경 환경”처럼 각 이미지의 역할을 명확히 정의하라고 안내한다.
- Nano Banana Pro는 최대 6~14개 입력 이미지를 표면별로 사용할 수 있고, 여러 인물의 일관성과 브랜드 룩 유지에 강점이 있다고 설명한다.
- 한계로 작은 텍스트, 세부 철자, 사실 정확성, 번역·현지화, 복잡한 편집, 캐릭터 일관성의 변동 가능성을 명시한다.

### fal.ai

- 참조 이미지 사용 시 먼저 각 이미지의 역할을 선언하고, 그다음 identity lock, 목표 이미지, 텍스트, 보존 조건, 네거티브를 작성하는 순서를 권장한다.
- “Use Image 1 for identity only; Image 2 for style only”처럼 참조 역할을 분리해야 얼굴이 스타일 참조로 변형되는 문제를 줄일 수 있다.
- Identity lock에는 얼굴 기하, 비율, 눈, 코, 입, 턱선, 광대, 피부 톤, 헤어라인, 헤어스타일, 나이, 인식 가능한 닮음을 포함한다.
- 하드 네거티브에는 no morphing, no identity drift, no face swap, no extra people, no misspelled text, no duplicate text, no watermark를 포함한다.
- 텍스트는 정확한 문구를 따옴표로 쓰고, 위치와 폰트 성격을 명시해야 한다.
- 얼굴이 80% 이상 맞으면 전체 재생성보다 대화형 부분 수정으로 좁히는 것이 드리프트를 줄인다.

## 신뢰도 평가 요약

- 1차 정책/스펙 판단: Google Cloud Blog, Google Blog, Vertex AI 공식 문서를 우선한다.
- 실무 템플릿 보강: fal.ai 자료는 참조 이미지 역할 지정과 인물 고정 프롬프트 패턴을 보조하기 위해 사용한다.
- 상충 시 처리: 컨텍스트 길이, 해상도, 지원 비율, 참조 이미지 수 등 스펙은 Google 공식 문서를 따른다. identity lock과 하드 네거티브 문구는 공식 원칙과 충돌하지 않는 범위에서 fal.ai 실무 패턴을 채택한다.
- 프로젝트 적용 제한: fal.ai API 예시는 구현 범위 근거가 아니며, 본 저장소의 방향은 OAuth 구독 CLI 전용이다.
