# Ryutility 성장 및 차별화 마스터 플랜 & 진척 현황

- **작성일**: 2026-11-25
- **목표**: 무가입 · 무서버(100% 브라우저 계산) · 투명한 공식 공개 · 모바일 10초 사용성이라는 Ryutility 정체성을 유지하면서 워크플로우 통합, 예측 신뢰도, 재방문 UX, 배포 채널을 단계적으로 확장합니다.

---

## 전체 진척 요약

| 단계 | 내용 | 상태 | 주요 산출물 |
| :--- | :--- | :---: | :--- |
| **Phase 1** | Riegel vs VDOT 이중 모델 비교 & 예측기 업그레이드 | **완료** | `assets/js/calc.js`, `predict/index.html`, `ko/predict/index.html`, `tests/predict.test.js` |
| **Phase 2** | 통합 훈련 브리프(`/brief/`) & `/run/` 확장 + URL 연동 | **완료** | `brief/index.html`, `ko/brief/index.html`, `run/index.html`, `ko/run/index.html`, `tests/calc.test.js` |
| **Phase 3** | 무가입 재방문 UX (`localStorage` 기준값 저장 & 인쇄 최적화) | **완료** | `assets/js/site.js`, `assets/css/site.css`, `brief/index.html`, `ko/brief/index.html`, `tests/profile.test.js` |
| **Phase 4** | 배포 채널 확장 (`?embed=1` 임베드 모드 & `/ko/guides/` 핵심 가이드) | **완료** | `assets/js/site.js`, `assets/css/site.css`, `_includes/header.html`, `_includes/footer.html`, `ko/guides/` |

**최신 검증 결과 (2026-11-25, 별도 테스트 에이전트 검증)**:
- `for f in tests/*.test.js; do node "$f"; done` → **전체 9개 파일, 93개 테스트 통과 (0 failed)** (`calc.test.js` 34, `consent.test.js` 7, `heat-pace.test.js` 9, `hr-zones.test.js` 5, `pace.test.js` 6, `predict.test.js` 8, `profile.test.js` 15, `splits.test.js` 4, `treadmill.test.js` 5).
- 신규/수정된 HTML/YAML 파일(`brief/`, `ko/brief/`, `ko/guides/*.html`, `_data/tools*.yml`)의 YAML front-matter, HTML 태그 짝, 내부 링크 경로 검증 완료.

---

## Phase 1. 예측 신뢰도 강화 & VDOT 이중 모델 비교 [완료]

### 완료 항목
- [x] `assets/js/calc.js`에 `timeFromVDOT(vdot, distKm)` 추가 (이분 탐색, 정밀도 < 0.5초)
- [x] `assets/js/calc.js`에 `vdotPredict(t1Sec, d1Km, d2Km)` 추가 (VDOT 30–85 범위 검증 포함) 및 `module.exports` 등록
- [x] `predict/index.html` & `ko/predict/index.html` 결과 테이블에 **Riegel** vs **VDOT** 병렬 비교, 추정 VDOT 요약, 각 거리별 **Splits →** 바로가기 링크 추가
- [x] `tests/predict.test.js`에 왕복 정합성 및 경계값 테스트 4건 추가 (8/8 통과)

---

## Phase 2. 핵심 시나리오 통합: "Training Brief" & 도구 간 URL 연동 [완료]

### 완료 항목
- [x] `assets/js/calc.js`에 `assessVdotGap(currentVdot, targetVdot)` 추가 (`maintain` / `realistic` / `ambitious` / `stretch`)
- [x] `run/index.html` & `ko/run/index.html`의 `Current Fitness`에 **Half / Full** 입력 및 `cur-hh` 토글 추가, `chh` URL 파라미터 지원
- [x] `run/index.html` & `ko/run/index.html` 상단에 `Current VDOT → Target VDOT (Δ)` 및 목표 현실성 피드백 배너(`#vdot-banner`) 추가
- [x] `brief/index.html` & `ko/brief/index.html` 신설: 최근 레이스 1회 입력 → VDOT 훈련 존 + Riegel vs VDOT 예측 + 목표 스플릿 미리보기 + 각 도구 원클릭 이동 + 링크 복사/인쇄
- [x] `_data/tools.yml`, `_data/tools_ko.yml`, `_includes/header.html`에 `/brief/` 및 `/ko/brief/` 등록
- [x] `tests/calc.test.js`에 `assessVdotGap` 단위 테스트 추가 (34/34 통과)

---

## Phase 3. 무가입 재방문 UX: 로컬 프로필 저장 & 프린트/모바일 최적화 [완료]

### 완료 항목
- [x] **로컬 기준값 저장 (`assets/js/site.js`)**
  - 저장 키 `ryutility-profile-v1`: `{ dist, hh, mm, ss, hrMax, hrRest, unit, targetDist, targetHh, targetMm, targetSs, targetDate }` (100% 브라우저 로컬 저장).
  - 초기화 우선순위: `URL 쿼리 파라미터 > localStorage 저장값 > 기본 예시값`.
  - 순수 직렬화/파싱 헬퍼(`loadSavedProfile`, `saveProfile`, `clearSavedProfile`, `calcDaysUntil`) 작성 및 `tests/profile.test.js` 단위 테스트 15건 추가.
- [x] **도구 UI 연동 (`brief/index.html`, `ko/brief/index.html`)**
  - `"Save as my baseline (내 기준값으로 저장)"` 및 `"Clear saved (저장 초기화)"` 버튼 추가.
  - `targetDate` 입력 시 `/brief/` 및 `/ko/brief/` 상단에 목표 대회 `D-XX` 배지 표시.
- [x] **인쇄/PDF 최적화 (`assets/css/site.css`)**
  - `@media print` 규칙 추가로 헤더·푸터·입력 폼·가이드 본문을 숨기고 결과 카드만 깔끔하게 출력.

---

## Phase 4. 배포 채널 확장: 초경량 임베드 & 한국어 SEO 완성 [완료]

### 완료 항목
- [x] **정적 임베드 모드 (`?embed=1`)**
  - `assets/js/site.js`에서 `isEmbedMode()` / `initEmbedMode()`로 `?embed=1` 감지 시 `document.body.classList.add('embed-mode')` 적용.
  - `assets/css/site.css`에서 `.embed-mode`일 때 헤더·푸터·가이드 본문을 숨기고 계산기 UI + 소형 `Powered by Ryutility` 링크만 표시.
  - 주요 도구(`/brief/`, `/run/`, `/predict/` 및 `/ko/` 대응 페이지) 하단에 `<iframe>` 임베드 코드 복사 스니펫 제공.
- [x] **한국어 핵심 가이드 구축 (`/ko/guides/`)**
  - `/ko/guides/` 허브 및 핵심 4편 번역/현지화 완료, `_includes/header.html` 및 `_includes/footer.html` 연결:
    1. VDOT 훈련 존 vs 심박수 존 (`vdot-vs-heart-rate-zones.html`)
    2. 리겔(Riegel) 공식의 한계와 현실적인 기록 예측 (`riegel-formula-race-prediction.html`)
    3. 마라톤 이븐 스플릿 vs 네거티브 스플릿 전략 (`even-vs-negative-splits.html`)
    4. 트레드밀 1% 인클라인과 야외 평지 페이스 보정 (`treadmill-incline-pace.html`)

---

## 추가 적용: 공개 저장소 라이선스 & 브랜드 보호 정책 [완료]
- [x] `LICENSE`: 소스 코드용 **MIT License** (Copyright (c) 2026 Jiman Ryu)
- [x] `CONTENT-LICENSE.md`: 가이드·해설·FAQ 문구용 **CC BY-NC 4.0** (상업적 복제 제한)
- [x] `TRADEMARKS.md`: `Ryutility` 이름·도메인(`ryutility.com`)·로고·디자인 사용 제한
- [x] `NOTICE`, `CONTRIBUTING.md`, `SECURITY.md`, `README.md` 작성 및 `_config.yml` `exclude:` 반영

## 배포 및 운영 체크리스트
- [x] PR #9 머지 및 `ryutility.com` 라이브 스모크 테스트 확인 (2026-11-25)
- [x] Google Search Console 사이트맵 및 신규 URL 색인 재제출 완료 (2026-11-25)
- [ ] (선택) GA4 핵심 행동 이벤트(`save_baseline`, `copy_share_link`, `embed_copy`) 계측 추가
- [ ] (선택) 차기 고도화: 모바일 공유 이미지 카드 / 마라톤 페이드(Fade) 보정 옵션

## 작업 규칙 (매 Phase 완료 시 체크)
1. `for f in tests/*.test.js; do node "$f"; done` 전체 통과 확인
2. 영문(`/`) 및 국문(`/ko/`) 페이지 동시 동기화 확인
3. 이 문서(`docs/superpowers/plans/2026-11-25-growth-roadmap.md`) 진척 상태 업데이트
