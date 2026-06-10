# 시퀀스 ↔ 코드 파일 매핑

> [docs/Sequence Diagram.png](Sequence%20Diagram.png) 의 3개 흐름이 **어느 파일/함수에서 동작하는지** 정리한 문서.
> 모든 화살표는 공통으로 프론트 [`lib/api.js`](../isd-frontend/src/lib/api.js)(HTTP·봉투 해제) → 백엔드 [`core/deps.py`](../isd-backend/app/core/deps.py)(인증·권한) → [`core/responses.py`](../isd-backend/app/core/responses.py)(`ok()` 응답봉투)를 거친다.

라인 번호는 작성 시점 기준이며 코드 변경 시 어긋날 수 있다(함수명으로 찾는 게 정확).

---

## ① 사용자가 트렌디 음식 주변 매장 찾기

| # | 동작 | 프론트 | 백엔드 → DB |
|---|------|--------|-------------|
| 1 | 트렌드 음식 선택 | [Home.jsx](../isd-frontend/src/pages/Home.jsx) 카드→`/map?trend=` · [Map.jsx](../isd-frontend/src/pages/Map.jsx) `FilterBar`→`pickTrend` | — |
| 2 | GET `/stores?trend_id&lat&lng` | [Map.jsx](../isd-frontend/src/pages/Map.jsx) `MapPage` useEffect | [stores.py](../isd-backend/app/routers/stores.py) `list_stores` |
| 3·4 | 매장+상품+재고 조회/반환 | — | [stores.py](../isd-backend/app/routers/stores.py) `list_stores` 내부 `db.table("stores")…` |
| 5 | 마커 데이터 반환 | [api.js](../isd-frontend/src/lib/api.js) 봉투 해제 | — |
| 6 | 지도 마커 표시 | [Map.jsx](../isd-frontend/src/pages/Map.jsx) `MapArea` + [naverMap.js](../isd-frontend/src/lib/naverMap.js) (지도 API) | — |
| 7 | 마커 클릭 → POST `/analytics/events` | [Map.jsx](../isd-frontend/src/pages/Map.jsx) `select` + [analytics.js](../isd-frontend/src/lib/analytics.js) `logEvent` | [analytics.py](../isd-backend/app/routers/analytics.py) `log_event` · 상세는 [stores.py](../isd-backend/app/routers/stores.py) `get_store` |

## ② 사장님 가입/입점신청 → 상품·재고 관리

| # | 동작 | 프론트 | 백엔드 → DB |
|---|------|--------|-------------|
| 1·2 | 소셜 로그인 → OAuth 세션 | [Login.jsx](../isd-frontend/src/pages/Login.jsx) `signInWithOAuth` + [supabase.js](../isd-frontend/src/lib/supabase.js) | *Supabase Auth (백엔드 안 거침)* |
| 3 | GET `/auth/me` | [Dashboard.jsx](../isd-frontend/src/pages/Dashboard.jsx) | [auth.py](../isd-backend/app/routers/auth.py) `me` |
| 4·5 | POST `/uploads/business-license` → URL 반환 | [Apply.jsx](../isd-frontend/src/pages/Apply.jsx) `api.upload` | [uploads.py](../isd-backend/app/routers/uploads.py) `upload_business_license` → [storage.py](../isd-backend/app/core/storage.py) (스토리지) |
| 6·7 | POST `/applications` → PENDING 저장 | [Apply.jsx](../isd-frontend/src/pages/Apply.jsx) | [applications.py](../isd-backend/app/routers/applications.py) `create_application` |
| 8 | GET `/applications/me` (신청현황) | [ApplyComplete.jsx](../isd-frontend/src/pages/ApplyComplete.jsx) | [applications.py](../isd-backend/app/routers/applications.py) `my_applications` |
| 9 | 승인 후 GET `/stores/me` | [Dashboard.jsx](../isd-frontend/src/pages/Dashboard.jsx) | [stores.py](../isd-backend/app/routers/stores.py) `my_stores` |
| 10 | POST `/stores/{id}/products` 또는 PATCH `/products/{id}/quantity` | [Dashboard.jsx](../isd-frontend/src/pages/Dashboard.jsx) `AddProductRow` · `ProductRow.changeQty` | [products.py](../isd-backend/app/routers/products.py) `create_product` · `update_quantity` |
| 11 | products 업데이트 + inventory_logs 저장 | — | [products.py](../isd-backend/app/routers/products.py) `update_quantity` 내부 (재고 변경 시 로그 자동 기록) |

## ③ 관리자가 입점 심사·승인

| # | 동작 | 프론트 | 백엔드 → DB |
|---|------|--------|-------------|
| 1·2 | 관리자 로그인 → 세션 | [AdminLogin.jsx](../isd-frontend/src/pages/AdminLogin.jsx) `api.post("/auth/admin-login")` | [auth.py](../isd-backend/app/routers/auth.py) `admin_login` |
| 3·4 | GET `/applications?status=PENDING` → 목록 조회 | [AdminApplications.jsx](../isd-frontend/src/pages/AdminApplications.jsx) | [applications.py](../isd-backend/app/routers/applications.py) `list_applications` |
| 5 | GET `/applications/{id}` (상세) | [AdminApplications.jsx](../isd-frontend/src/pages/AdminApplications.jsx) | [applications.py](../isd-backend/app/routers/applications.py) `get_application` |
| 6 | POST `/applications/{id}/approve` | [AdminApplications.jsx](../isd-frontend/src/pages/AdminApplications.jsx) | [applications.py](../isd-backend/app/routers/applications.py) `approve` |
| 7 | stores 생성 + APPROVED | — | [applications.py](../isd-backend/app/routers/applications.py) `approve` (매장 자동 생성 트랜잭션) |
| 8 | 승인 완료 반환 | [api.js](../isd-frontend/src/lib/api.js) | — |

---

## ⚠️ 다이어그램과 실제 코드 차이

**시퀀스 ③의 관리자 로그인** — 다이어그램은 "Supabase Auth 세션 발급"으로 그려져 있으나, 실제 코드는 **백엔드 `POST /auth/admin-login`**([auth.py](../isd-backend/app/routers/auth.py) `admin_login`)을 사용한다. 관리자는 소셜이 아니라 ID/PW 인증이라 백엔드에서 처리한다. 다이어그램을 "Admin UI → Backend `/auth/admin-login`"으로 갱신하는 것이 정확하다.
