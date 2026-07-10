# GPT Image 2.0 공식/준공식 가이드 출처

수집일: 2026-07-07

## 출처 목록

| 구분 | 출처 | 링크 | 신뢰도 평가 |
| --- | --- | --- | --- |
| 공식 | OpenAI Cookbook, “GPT Image Generation Models Prompting Guide” | https://developers.openai.com/cookbook/examples/multimodal/image-gen-models-prompting-guide | 공식. 모델 제작사 문서이며 `gpt-image-2`의 기본 프롬프트 원칙, 크기 제약, 품질 설정, 편집·텍스트·다중 이미지 패턴의 1차 근거로 사용한다. |
| 공식 | OpenAI API Models, “GPT Image 2” | https://developers.openai.com/api/docs/models/gpt-image-2 | 공식. 모델명, 스냅샷, 입출력 성격을 확인하는 기준 문서로 사용한다. |
| 준공식/실무 가이드 | Atlabs AI, “The Ultimate GPT Image 2 Prompting Guide: How to Use OpenAI’s Best Image Model [2026]” | https://www.atlabs.ai/blog/the-ultimate-gpt-image-2-prompting-guide-how-to-use-openai%E2%80%99s-best-image-model-2026 | 준공식. 제품 제작사는 아니지만 GPT Image 2 전용 실무 프롬프트 구조와 금기 사례를 정리한 2차 해설로 사용한다. |
| 커뮤니티/플랫폼 가이드 | fal.ai, “GPT Image 2 Prompting Guide and Examples” | https://fal.ai/learn/tools/prompting-gpt-image-2 | 커뮤니티/플랫폼. 호스팅 플랫폼의 실전 템플릿과 편집 Preserve 패턴을 보조 근거로 사용한다. |
| 커뮤니티/플랫폼 문서 | fal.ai, “openai/gpt-image-2 API” | https://fal.ai/models/openai/gpt-image-2/api | 커뮤니티/플랫폼. 파라미터와 엔드포인트 용어 참고용이며 이 프로젝트의 API 키 기반 구현 근거로는 사용하지 않는다. |

## 핵심 인용

### OpenAI Cookbook

- “This guide highlights prompting patterns, best practices, and example prompts drawn from real production use cases for `gpt-image-2`.”
- “It is our most capable image model, with stronger image quality, improved editing performance, and broader support for production workflows.”
- “Use a consistent structure”와 “constraints”를 분리하라는 원칙: 배경/장면, 피사체, 핵심 디테일, 제약을 유지보수 가능한 순서로 쓰는 것이 권장된다.
- 이미지 안 텍스트는 따옴표 또는 대문자로 정확히 지정하고, 폰트 스타일·크기·색·위치를 제약으로 적는 것이 권장된다.
- 편집은 “change only X”와 보존 목록을 함께 쓰며, 반복 편집마다 보존할 얼굴·기하·레이아웃·브랜드 요소를 다시 명시해야 한다.
- `gpt-image-2` 크기는 최대 변이 3840px 미만, 양 변 16의 배수, 장단변 비율 3:1 이하, 총 픽셀 범위 제약을 따르며 2K 초과는 실험적으로 취급한다.

### OpenAI API Models

- `gpt-image-2`는 OpenAI의 최신 이미지 생성·편집 모델로 취급한다.
- 스냅샷 `gpt-image-2-2026-04-21`이 확인된 기준 버전이다.

### Atlabs AI

- GPT Image 2는 키워드 스팸보다 자연어 기반의 명확한 브리프에 더 잘 반응한다는 실무 지침을 제공한다.
- 권장 공식: `[Subject + Adjectives] doing [Action] in [Scene/Context]` 다음에 Composition/Camera, Lighting/Atmosphere, Style/Medium, Exact Text/Typography, Aspect Ratio/Use Case를 붙인다.
- 편집 시 “Change only…”와 “Preserve…”를 나누고, 얼굴·포즈·의상·로고·조명 방향을 보존 목록에 넣으라는 지침을 제공한다.
- 4K가 항상 좋은 결과를 의미하지 않으며, 과한 요구를 한 번에 넣는 것을 피하라는 경고가 있다.

### fal.ai

- GPT Image 2는 구조화된 브리프에 반응하므로 `Scene / Subject / Important details / Use case / Constraints` 순서를 권장한다.
- 구체적 시각 사실이 “stunning, ultra-detailed, masterpiece” 같은 형용사 더미보다 낫다.
- 포스터·UI·라벨·광고의 문구는 정확히 따옴표로 작성하고, 추가 텍스트·중복 텍스트·워터마크 금지를 제약으로 둔다.
- 편집은 `Change / Preserve / Constraints`로 분리하며 Preserve에 얼굴, 피부 톤, 포즈, 배경, 카메라 앵글, 프레이밍, 조명을 포함한다.

## 신뢰도 평가 요약

- 1차 정책/스펙 판단: OpenAI 공식 문서를 우선한다.
- 실무 템플릿 보강: Atlabs AI와 fal.ai를 보조 자료로 사용한다.
- 상충 시 처리: 해상도, 모델명, 품질 설정, 공식 기능 범위는 OpenAI 문서를 따른다. 스타일·편집 예시는 보조 문서의 공통분모만 채택한다.
- 프로젝트 적용 제한: fal.ai API 예시는 구현 범위 근거가 아니며, 본 저장소의 방향은 OAuth 구독 CLI 전용이다.
