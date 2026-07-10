# 골든셋 파티션·축적 운영 규약

이 디렉터리는 v1 평가에 쓰는 기준 프롬프트를 파티션으로 나누어 관리한다. 실제 프롬프트 내용은 필요한 실행 맥락에만 노출하며, 합격 로그와 매니페스트에는 크기와 해시만 기록한다.

## 파티션

- `reference/`: few-shot 예시, 프리셋 후보, 성공 사례 승격용 파티션이다. 생성 컨텍스트에 노출할 수 있다.
- `holdout-eval/`: 골든셋 블라인드 전용 파티션이다. 생성 컨텍스트와 심판 컨텍스트에 프롬프트 내용을 노출하지 않는다. 이 파티션은 gitignore 대상이며, 저장소에는 내용 파일을 커밋하지 않는다.

## 파일 형식

- 1개 프롬프트는 1개 파일로 보관한다.
- 허용 확장자는 `.md` 또는 `.yaml`이다.
- 모든 파일은 다음 메타데이터를 포함해야 한다.
  - `source`: `fable5-user-provided`, `user-curated-public`, `collected-public`, `promoted-success` 중 하나.
  - `registeredAt`: 등록일. `YYYY-MM-DD` 형식을 사용한다.
- `.md` 파일은 YAML front matter를 사용한다.
- `.yaml` 파일은 최상위에 같은 키를 둔다.
- 파일명은 내용을 추론할 수 없는 불투명 순번 id로 제한한다. 예: `reference/001.md`, `holdout-eval/h-001.md`.

예시:

```yaml
source: fable5-user-provided
registeredAt: 2026-07-07
```

## 파티션 기록 규약

파티션이 바뀔 때마다 `workspace/reports/golden-set-manifest-YYYY-MM-DD.json`에 각 파티션 크기와 파일별 `sha256` 목록을 기록한다. 매니페스트와 합격 로그에는 프롬프트 원문, 요약, 제목처럼 내용을 추론할 수 있는 값을 쓰지 않는다.

형식 예시:

```json
{
  "schemaKind": "golden-set-manifest",
  "createdAt": "2026-07-07T00:00:00Z",
  "partitions": {
    "reference": {
      "size": 3,
      "files": [
        { "path": "core/style-library/golden-set/reference/001.md", "sha256": "<sha256>" }
      ]
    },
    "holdout-eval": {
      "size": 10,
      "files": [
        { "path": "core/style-library/golden-set/holdout-eval/h-001.md", "sha256": "<sha256>" }
      ]
    }
  }
}
```

합격 로그에는 `reference.size`, `holdout-eval.size`, 파일별 `sha256`, 블라인드 평가의 `N`, `M`, `accuracy`, `band`만 기록한다. `holdout-eval/` 내용은 생성·심판 컨텍스트와 로그에 모두 비노출한다.

## 점진 축적 운영

- 초기에는 사용자 제공 프롬프트가 10개 미만이어도 시작할 수 있다.
- 동일 프롬프트를 `reference/`와 `holdout-eval/`에 이중 등록하지 않는다.
- 사용자 제공 Fable 5 프롬프트는 `reference/`와 `holdout-eval/`에 분배하되, 블라인드 평가 성립을 위해 `holdout-eval/`을 우선 충원한다.
- `holdout-eval/`에는 `fable5-user-provided` 또는 `user-curated-public` 항목만 넣는다. `promoted-success`는 자기오염 방지를 위해 투입하지 않는다.
- `user-curated-public` 홀드아웃 조건(전부 충족 필수): ① 사용자가 결과물 품질을 직접 확인하고 최상급으로 인정한 공개 프롬프트일 것 ② 하네스 컨텍스트(현재·과거 세션, 수확 코퍼스, 열람 링크 포함)에 원문이 노출된 적 없을 것 — 하네스가 읽은 게시물·수집물은 영구 결격 ③ 등록은 사용자가 직접 파일로 수행하고 등록 후에도 원문을 하네스와 공유하지 않을 것. 단순 `collected-public`(하네스가 수집한 공개 프롬프트)은 홀드아웃 불가, 축소 벤치 전용을 유지한다.
- 홀드아웃 후보·등록분의 출처 URL은 `workspace/reports/holdout-source-quarantine.md`에 기록하고, 하네스는 그 목록의 게시물을 어떤 세션에서도 열람·수확하지 않는다.
- 실생성 평가를 통과하고 사용자가 만족한 프롬프트는 `promoted-success` 출처로 `reference/`에만 승격할 수 있다.
- 골든셋 블라인드는 `holdout-eval/` 쿼럼이 `N=M=10~15`에 도달했을 때 실행할 수 있다.
- 블라인드 기준선은 50%이며, 합격 밴드는 반올림된 `accuracy` 기준 50%±10%p, 즉 0.40 이상 0.60 이하를 경계 포함으로 비교한다.
- 수집 공개 프롬프트로 만든 축소 벤치는 탐색적·잠정 진단 전용이다. 축소 벤치는 v1 acceptance #4의 증거로 인정하지 않는다.
