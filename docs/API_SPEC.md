# Foorendy — REST API 명세서

> Food + Trendy · ISD 2026 팀 프로젝트
> Backend: **FastAPI · PostgreSQL(Supabase)** · (Redis·APScheduler: 선택/배치, 현재 미사용)
> 본 문서는 [schema.sql](schema.sql)의 9개 테이블과 화면 플로우(Home / Map / Dashboard / Apply / Admin)를 기준으로 작성되었습니다.

---

## 1. 공통 사항

### Base URL
```
https://api.foorendy.co/v1
```

### 인증 (Authentication)
- 인증은 **Supabase Auth(JWT)** 기반. 소셜 로그인(Google / Kakao / Naver)으로 발급된 access token을 사용합니다.
- 보호된 엔드포인트는 헤더에 Bearer 토큰을 포함해야 합니다.

```
Authorization: Bearer <access_token>
```

| 권한 레벨 | 표기 | 설명 |
|-----------|------|------|
| 비로그인(손님) | 🔓 Public | 토큰 불필요. 익명 `visitor_id`로 식별 |
| 사장님 | 🔑 Owner | `owners` 토큰 필요. 본인 매장만 접근 |
| 심사자 | 🛡 Admin | `admin` 토큰 필요 |

### 공통 응답 형식
성공:
```json
{ "data": { ... }, "meta": { ... } }
```
목록(페이지네이션):
```json
{
  "data": [ ... ],
  "meta": { "page": 1, "page_size": 20, "total": 135 }
}
```
에러:
```json
{
  "error": { "code": "STORE_NOT_FOUND", "message": "매장을 찾을 수 없습니다." }
}
```

### 공통 쿼리 파라미터 (목록 API)
| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| `page` | int | 1 | 페이지 번호 |
| `page_size` | int | 20 | 페이지 크기 (최대 100) |
| `sort` | string | - | 정렬 키 (예: `distance`, `-submitted_at`) |

### 상태 코드
| 코드 | 의미 |
|------|------|
| 200 | 성공 |
| 201 | 생성됨 |
| 204 | 성공(본문 없음) |
| 400 | 잘못된 요청 |
| 401 | 인증 필요 |
| 403 | 권한 없음 |
| 404 | 리소스 없음 |
| 409 | 충돌(중복 신청 등) |
| 422 | 유효성 검증 실패 |

---

## 2. 엔드포인트 요약

| # | Method | Path | 권한 | 설명 |
|---|--------|------|------|------|
| **Auth** ||||
| 1 | ~~POST~~ | `/auth/callback` | 🔓 | 소셜 로그인 콜백 — **Supabase 클라이언트 처리**(`supabase.auth.signInWithOAuth`), 백엔드 엔드포인트 불필요 |
| 2 | GET | `/auth/me` | 🔑/🛡 | 내 프로필 조회 |
| 3 | ~~POST~~ | `/auth/logout` | 🔑/🛡 | 로그아웃 — **Supabase 클라이언트 처리**(`supabase.auth.signOut`), 백엔드 엔드포인트 불필요 |
| 34 | DELETE | `/auth/me` | 🔑 | 회원 탈퇴(본인 매장+계정 삭제) (신규) |
| **Trends** ||||
| 4 | GET | `/trends` | 🔓 | 트렌드 랭킹 TOP N |
| 5 | GET | `/trends/{trend_id}` | 🔓 | 트렌드 상세 |
| 6 | GET | `/trends/search-ranking` | 🔓 | 실시간 인기 검색어 |
| **Stores** ||||
| 7 | GET | `/stores` | 🔓 | 매장 목록(지도/주변) |
| 8 | GET | `/stores/{store_id}` | 🔓 | 매장 상세(팝오버) |
| 9 | GET | `/stores/me` | 🔑 | 내 매장 목록 |
| 10 | PATCH | `/stores/{store_id}` | 🔑 | 매장 정보 수정 |
| 35 | DELETE | `/stores/{store_id}` | 🔑 | 매장 삭제(본인 매장만) (신규) |
| **Products / 재고** ||||
| 11 | GET | `/stores/{store_id}/products` | 🔓 | 매장 상품 목록 |
| 12 | POST | `/stores/{store_id}/products` | 🔑 | 상품 등록 |
| 13 | PATCH | `/products/{product_id}` | 🔑 | 상품 수정 |
| 14 | PATCH | `/products/{product_id}/quantity` | 🔑 | 재고 수량 변경 |
| 15 | DELETE | `/products/{product_id}` | 🔑 | 상품 삭제 |
| 16 | GET | `/products/{product_id}/inventory-logs` | 🔑 | 재고 변경 이력 |
| 33 | POST | `/uploads/product-image` | 🔑 | 상품 이미지 업로드 (신규) |
| **Notices / 공지** ||||
| 17 | GET | `/stores/{store_id}/notices` | 🔓 | 공지 목록 |
| 18 | POST | `/stores/{store_id}/notices` | 🔑 | 공지 등록 |
| 19 | PATCH | `/notices/{notice_id}` | 🔑 | 공지 수정 |
| 20 | DELETE | `/notices/{notice_id}` | 🔑 | 공지 삭제 |
| **Applications / 입점 신청** ||||
| 21 | POST | `/applications` | 🔑 | 입점 신청 제출 |
| 22 | GET | `/applications/me` | 🔑 | 내 신청 현황 |
| 23 | GET | `/applications` | 🛡 | 신청 목록(심사) |
| 24 | GET | `/applications/{application_id}` | 🛡 | 신청 상세 |
| 25 | POST | `/applications/{application_id}/approve` | 🛡 | 승인 |
| 26 | POST | `/applications/{application_id}/reject` | 🛡 | 반려 |
| 27 | POST | `/uploads/business-license` | 🔑 | 사업자등록증 업로드 |
| **Analytics** ||||
| 28 | POST | `/analytics/events` | 🔓 | 익명 이벤트 로그 수집 |
| 29 | GET | `/stores/{store_id}/analytics/summary` | 🔑 | 대시보드 KPI |
| 30 | GET | `/stores/{store_id}/analytics/timeseries` | 🔑 | 시간대별 조회 |
| 31 | GET | `/stores/{store_id}/analytics/events` | 🔑 | 최근 이벤트 로그 |
| 32 | GET | `/admin/applications/summary` | 🛡 | 심사 KPI |

---

## 3. Auth

### 1) POST `/auth/callback` 🔓 — *Supabase 클라이언트 처리 (백엔드 불필요)*
SPA에서는 `supabase.auth.signInWithOAuth({ provider })`가 OAuth 리다이렉트·세션 발급을 **클라이언트에서 직접** 처리한다. 별도 백엔드 콜백 엔드포인트는 호출하지 않는다.
> 서버사이드 코드 교환 방식으로 전환할 경우의 참고 형태:
> - Request: `{ "provider": "google"|"kakao"|"naver", "code": "<oauth_code>", "role": "owner"|"admin" }`
> - Response: `{ "data": { "access_token", "refresh_token", "expires_in", "user": { "id", "email", "role" } } }`

### 2) GET `/auth/me` 🔑/🛡
**Response 200**
```json
{ "data": { "id": "uuid", "email": "kim@yeonnam.cafe", "role": "owner", "created_at": "2026-06-01T09:00:00Z" } }
```

### 3) POST `/auth/logout` 🔑/🛡 — *Supabase 클라이언트 처리 (백엔드 불필요)*
`supabase.auth.signOut()`으로 클라이언트 세션을 종료한다. 백엔드 엔드포인트는 호출하지 않는다.
> 로그아웃("세션 종료")은 클라이언트로 가능하지만, **회원 탈퇴("계정 영구삭제")는 service-role 권한이 필요해 백엔드 전용** → 아래 34) `DELETE /auth/me` 참고.

### 34) DELETE `/auth/me` 🔑 (신규)
회원 탈퇴. UI.pen "10 회원 탈퇴" 플로우. 본인 소유 매장과 계정을 모두 삭제한다.

1. 본인 `stores` 삭제 → FK cascade 로 `products`/`store_notices`/`inventory_logs` 동반 삭제
2. `owners` 행 삭제
3. Supabase Auth 유저 삭제(service-role admin)

→ `204 No Content`

---

## 4. Trends

### 4) GET `/trends` 🔓
홈 화면의 "트렌디 푸드 랭킹 TOP 10".

**Query**: `limit` (기본 10), `status` (`HOT`|`RISING`|`FALLING`)

**Response 200**
```json
{
  "data": [
    {
      "trend_id": 1,
      "name": "우베",
      "trend_score": 98.2,
      "rank": 1,
      "previous_rank": 2,
      "score_change_pct": 12.5,
      "status": "HOT",
      "store_count": 27,
      "updated_at": "2026-05-26T14:00:00Z"
    }
  ],
  "meta": { "updated_at": "2026-05-26T14:00:00Z" }
}
```
> `store_count`는 해당 트렌드를 판매하는 매장 수(파생 값).

### 5) GET `/trends/{trend_id}` 🔓
**Response 200**: 위 단일 객체 + 판매 매장 수 등.

### 6) GET `/trends/search-ranking` 🔓
Hero 영역 "실시간 인기 검색어". 손님의 `SEARCH_TREND` 이벤트(`analytics_logs`)를 최근 `window_hours`(기본 24h) 동안 trend별로 집계해 상위 N개를 반환하고, 직전 동일 길이 윈도우와 비교해 순위 변동을 계산한다. **DB 집계 방식**(Redis 불필요 — 트래픽 증가 시 Redis ZSET 캐싱으로 최적화 가능).

**Query**: `limit`(기본 5, 최대 20), `window_hours`(기본 24, 최대 168)

**Response 200**
```json
{
  "data": [
    { "rank": 1, "trend_id": 1, "name": "우베", "emoji": "🟣", "count": 142, "delta": 1, "direction": "up" },
    { "rank": 2, "trend_id": 2, "name": "두바이초콜릿", "emoji": "🍫", "count": 98, "delta": 1, "direction": "down" }
  ],
  "meta": { "refreshed_at": "2026-05-26T14:00:00Z", "window_hours": 24 }
}
```
> `delta`는 순위 변동 크기(0 이상), `direction`은 `up`/`down`. 직전 윈도우에 없던 신규 항목은 `direction: "up"`, `delta: 0`.

---

## 5. Stores

### 7) GET `/stores` 🔓
지도/주변 매장 목록. 위치 + 트렌드 + 재고 필터.

**Query**
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `lat`, `lng` | float | 사용자 현재 위치 |
| `radius` | float | 반경(km), 기본 1.5 |
| `trend_id` | int | 특정 트렌드 판매 매장만 |
| `stock_status` | string | `AVAILABLE`,`LOW` (CSV, `SOLD_OUT` 제외 등) |
| `sort` | string | `distance`(기본) |

**Response 200**
```json
{
  "data": [
    {
      "store_id": 101,
      "name": "연남 우베하우스",
      "latitude": 37.5631,
      "longitude": 126.9255,
      "distance_km": 0.4,
      "naver_place_url": "https://place.naver.com/...",
      "featured_product": {
        "product_id": 5001,
        "name": "우베 케이크",
        "price": 6800,
        "quantity": 8,
        "stock_status": "LOW",
        "stock_updated_at": "2026-05-26T13:50:00Z"
      },
      "trend": { "trend_id": 1, "name": "우베" }
    }
  ],
  "meta": { "total": 27, "center": { "lat": 37.557, "lng": 126.924 } }
}
```

### 8) GET `/stores/{store_id}` 🔓
지도 마커 클릭 시 팝오버 상세.

**Response 200**
```json
{
  "data": {
    "store_id": 101,
    "name": "연남 우베하우스",
    "address": "서울 마포구 연남동 ...",
    "phone": "02-1234-5678",
    "latitude": 37.5631,
    "longitude": 126.9255,
    "naver_place_url": "https://place.naver.com/...",
    "products": [ { "product_id": 5001, "name": "우베 케이크", "price": 6800, "quantity": 8, "stock_status": "LOW", "stock_updated_at": "2026-05-26T13:50:00Z", "image_url": null } ],
    "active_notice": { "notice_id": 9001, "content": "매일 11시 오픈! ...", "expires_at": "2026-05-29T00:00:00Z" }
  }
}
```

### 9) GET `/stores/me` 🔑
대시보드 매장 선택 드롭다운용. 로그인 사장님의 매장 목록.

### 10) PATCH `/stores/{store_id}` 🔑
본인 매장만. Body: `name`, `address`, `phone`, `naver_place_url` 등 부분 수정.

### 35) DELETE `/stores/{store_id}` 🔑 (신규)
매장 삭제(본인 매장만). FK cascade 로 메뉴/재고/공지/재고이력도 함께 삭제. 존재하지 않으면 `404 STORE_NOT_FOUND`, 타인 매장이면 `403`.

→ `204 No Content`

---

## 6. Products & 재고

### 11) GET `/stores/{store_id}/products` 🔓
**Query**: `q`(메뉴 검색), `stock_status`

**Response 200**
```json
{
  "data": [
    {
      "product_id": 5001,
      "store_id": 101,
      "trend": { "trend_id": 1, "name": "우베" },
      "name": "우베 케이크",
      "price": 6800,
      "quantity": 8,
      "stock_status": "AVAILABLE",
      "stock_updated_at": "2026-05-26T13:50:00Z",
      "image_url": null,
      "created_at": "2026-05-01T09:00:00Z"
    }
  ]
}
```

### 12) POST `/stores/{store_id}/products` 🔑
대시보드 "메뉴 등록".

**Request**
```json
{ "trend_id": 1, "name": "우베 라떼", "price": 5500, "quantity": 14, "image_url": null }
```
- `trend_id`, `name` 필수. `stock_status`는 `quantity` 기준 서버 자동 계산.

**Response 201**: 생성된 product 객체.

### 13) PATCH `/products/{product_id}` 🔑
이름/가격/트렌드 연결/이미지 수정.

### 14) PATCH `/products/{product_id}/quantity` 🔑
대시보드 +/- 수량 조절. **수량 변경 시 `inventory_logs`에 자동 기록**, `stock_status`·`stock_updated_at` 갱신, 지도에 실시간 반영.

**Request**
```json
{ "quantity": 8 }
```
또는 증감:
```json
{ "delta": -1 }
```

**Response 200**
```json
{
  "data": {
    "product_id": 5001,
    "quantity": 8,
    "stock_status": "LOW",
    "stock_updated_at": "2026-05-26T14:00:00Z"
  }
}
```
> `stock_status` 규칙(예시): `0` → `SOLD_OUT`, `1~5` → `LOW`, 그 외 → `AVAILABLE`.

### 15) DELETE `/products/{product_id}` 🔑 → `204`

### 16) GET `/products/{product_id}/inventory-logs` 🔑
"최근 재고 변경 이력".

**Response 200**
```json
{
  "data": [
    { "log_id": 7001, "old_quantity": 12, "new_quantity": 8, "updated_at": "2026-05-26T10:32:00Z" },
    { "log_id": 7000, "old_quantity": 0,  "new_quantity": 5, "updated_at": "2026-05-26T09:48:00Z" }
  ]
}
```

### 33) POST `/uploads/product-image` 🔑 (신규)
상품 이미지 업로드. 메뉴(상품) 사진 파일 업로드 — 대시보드 "메뉴 등록"에서 사진 첨부 시 선행 호출.
반환된 `image_url` 을 `POST /stores/{store_id}/products` 의 `image_url` 로 넘긴다.

**Request** `multipart/form-data`: `file` (JPG/PNG/WebP, 최대 10MB)

**Response 201**
```json
{ "data": { "image_url": "https://<project>.supabase.co/storage/v1/object/public/product-images/<uuid>.png" } }
```
> Supabase Storage 공개 버킷 `product-images` 에 저장. 유효성 실패 시 `422 INVALID_FILE_TYPE` / `FILE_TOO_LARGE`.

---

## 7. Notices (공지)

### 17) GET `/stores/{store_id}/notices` 🔓
**Query**: `status`(`PUBLISHED`|`DRAFT`). 손님에게는 `PUBLISHED` + 미만료만 노출.

### 18) POST `/stores/{store_id}/notices` 🔑
**Request**
```json
{ "content": "우베 케이크 25개 입고 완료! ...", "status": "PUBLISHED", "expires_at": "2026-05-29T00:00:00Z" }
```
**Response 201**: notice 객체.

### 19) PATCH `/notices/{notice_id}` 🔑 — 내용/상태/만료 수정
### 20) DELETE `/notices/{notice_id}` 🔑 → `204`

---

## 8. Applications (입점 신청)

### 27) POST `/uploads/business-license` 🔑
사업자등록증 파일 업로드(멀티파트). 제출 전 선행 호출.

**Request** `multipart/form-data`: `file` (PDF/JPG/PNG, 최대 10MB)

**Response 201**
```json
{ "data": { "business_license_url": "https://storage.foorendy.co/biz/uuid.pdf" } }
```

### 21) POST `/applications` 🔑
Apply 화면 "입점 신청 제출".

**Request**
```json
{
  "cafe_name": "연남 우베하우스",
  "applicant_name": "김연남",
  "address": "서울특별시 마포구 연남동 ...",
  "phone": "02-1234-5678",
  "business_reg_no": "123-45-67890",
  "business_license_url": "https://storage.foorendy.co/biz/uuid.pdf",
  "terms_agreed_at": "2026-06-07T14:32:00Z",
  "marketing_agreed": false
}
```
- 필수: `cafe_name`, `address`, `business_reg_no`, `business_license_url`, `terms_agreed_at`.
- `applicant_id`는 토큰에서 추출. 동일 사업자번호 PENDING 중복 시 `409`.

**Response 201**
```json
{ "data": { "application_id": 612, "status": "PENDING", "submitted_at": "2026-06-07T14:32:00Z" } }
```

### 22) GET `/applications/me` 🔑
ApplyComplete 화면(심사 진행 상태).

**Response 200**
```json
{ "data": [ { "application_id": 612, "cafe_name": "연남 우베하우스", "status": "PENDING", "rejection_reason": null, "store_id": null, "submitted_at": "2026-06-07T14:32:00Z", "reviewed_at": null } ] }
```

### 23) GET `/applications` 🛡
Admin 테이블. 탭 필터 + 검색.

**Query**
| 파라미터 | 설명 |
|----------|------|
| `status` | `PENDING`,`APPROVED`,`REJECTED` (탭) |
| `q` | 매장명 / 사업자번호 검색 |
| `sort` | `-submitted_at`(기본) |
| `page`, `page_size` | 페이지네이션 |

**Response 200**
```json
{
  "data": [
    {
      "application_id": 612,
      "cafe_name": "연남 우베하우스",
      "applicant_name": "김연남",
      "address": "서울 마포구 연남동",
      "business_reg_no": "123-45-67890",
      "status": "PENDING",
      "submitted_at": "2026-06-07T14:32:00Z"
    }
  ],
  "meta": { "page": 1, "page_size": 20, "total": 135 }
}
```

### 24) GET `/applications/{application_id}` 🛡
DetailPanel. 전체 필드 + 서류 다운로드 URL 포함.

**Response 200**
```json
{
  "data": {
    "application_id": 612,
    "applicant_name": "김연남",
    "email": "kim@yeonnam.cafe",
    "cafe_name": "연남 우베하우스",
    "address": "서울 마포구 연남동",
    "phone": "010-1234-5678",
    "business_reg_no": "123-45-67890",
    "business_license_url": "https://storage.foorendy.co/biz/uuid.pdf",
    "marketing_agreed": false,
    "terms_agreed_at": "2026-06-07T14:32:00Z",
    "status": "PENDING",
    "rejection_reason": null,
    "store_id": null,
    "reviewed_by": null,
    "reviewed_at": null,
    "submitted_at": "2026-06-07T14:32:00Z"
  }
}
```

### 25) POST `/applications/{application_id}/approve` 🛡
승인 시 **`stores` 레코드 자동 생성**, 신청서 `status=APPROVED`·`store_id`·`reviewed_by`·`reviewed_at` 기록.

**Response 200**
```json
{ "data": { "application_id": 612, "status": "APPROVED", "store_id": 101, "reviewed_at": "2026-06-08T10:00:00Z" } }
```

### 26) POST `/applications/{application_id}/reject` 🛡
**Request**
```json
{ "rejection_reason": "사업자등록증 식별 불가 — 재업로드 요청" }
```
**Response 200**
```json
{ "data": { "application_id": 678, "status": "REJECTED", "rejection_reason": "...", "reviewed_at": "2026-06-08T10:05:00Z" } }
```

---

## 9. Analytics

### 28) POST `/analytics/events` 🔓
손님 익명 행동 로그 수집(`analytics_logs`).

**Request**
```json
{
  "visitor_id": "anon-7f3a...",
  "event_type": "VIEW_STORE",
  "store_id": 101,
  "product_id": 5001,
  "trend_id": 1
}
```
- `event_type`: `VIEW_STORE` | `SEARCH_TREND` | `CLICK_MARKER`
- 관련 없는 식별자는 `null` 허용.

**Response 202** (수집만, 본문 없음 또는 `{ "data": { "logged": true } }`)

### 29) GET `/stores/{store_id}/analytics/summary` 🔑
대시보드 KPI 카드.

**Query**: `date`(기본 today)

**Response 200**
```json
{
  "data": {
    "store_views_today": 1248,
    "store_views_delta": 245,
    "store_views_change_pct": 24,
    "search_entry_trend": { "name": "우베", "rank": 1, "exposure_pct": 38 },
    "stock_changes_today": 5,
    "last_stock_update": "2026-05-26T13:50:00Z",
    "trend_score": 98.2,
    "trend_score_change_pct": 38,
    "trend_percentile": 1
  }
}
```

### 30) GET `/stores/{store_id}/analytics/timeseries` 🔑
"시간대별 매장 조회" 차트 + "트렌드별 조회수".

**Query**: `range`(`7d` 기본), `metric`(`views`|`by_trend`)

**Response 200 — `metric=views`**
```json
{
  "data": {
    "range": "7d",
    "buckets": [
      { "hour": "08", "views": 18 },
      { "hour": "14", "views": 160 }
    ],
    "total": 1248,
    "peak": { "from": "14:00", "to": "16:00" }
  }
}
```
**Response 200 — `metric=by_trend`**
```json
{
  "data": [
    { "trend_id": 1, "name": "우베", "views": 1420, "pct": 100 },
    { "trend_id": 2, "name": "두바이초콜릿", "views": 980, "pct": 69 }
  ]
}
```

### 31) GET `/stores/{store_id}/analytics/events` 🔑
"최근 이벤트 로그".

**Response 200**
```json
{
  "data": [
    { "event_type": "VIEW_STORE", "count": 24, "label": "신규 사용자 24명", "desc": "우베 검색 → 매장 상세 진입", "created_at": "2026-05-26T14:00:00Z" },
    { "event_type": "CLICK_MARKER", "count": 18, "desc": "홍대입구 반경 1km 사용자", "created_at": "2026-05-26T13:57:00Z" }
  ]
}
```

### 32) GET `/admin/applications/summary` 🛡
Admin KPI 카드.

**Response 200**
```json
{
  "data": {
    "pending": 12,
    "approved_today": 5,
    "rejected_this_week": 2,
    "total_stores": 127
  }
}
```

---

## 10. 데이터 모델 ↔ 엔드포인트 매핑

| 테이블 | 주요 엔드포인트 |
|--------|------------------|
| `owners` / `admin` | `/auth/*` |
| `trends` | `/trends`, `/trends/search-ranking` |
| `stores` | `/stores`, `/stores/{id}`, `/stores/me` |
| `products` | `/stores/{id}/products`, `/products/{id}`, `/products/{id}/quantity` |
| `inventory_logs` | `/products/{id}/inventory-logs` (수량 변경 시 자동 생성) |
| `analytics_logs` | `/analytics/events`, `/stores/{id}/analytics/*` |
| `store_notices` | `/stores/{id}/notices`, `/notices/{id}` |
| `store_applications` | `/applications/*` |

---

## 11. 비고 / 정책

- **재고 상태 자동화**: 수량 변경(`PATCH /products/{id}/quantity`) 시 `inventory_logs` 기록 + `stock_status`·`stock_updated_at` 자동 갱신.
- **승인 트랜잭션**: 입점 승인 시 `store_applications.status` 변경과 `stores` 생성은 단일 트랜잭션으로 처리.
- **익명 로그**: `analytics_logs`는 개인정보를 담지 않으며 `visitor_id`는 클라이언트 생성 익명 식별자.
- **인기 검색어**: `analytics_logs`의 `SEARCH_TREND` 이벤트를 DB 집계(`GET /trends/search-ranking`). Redis 불필요(추후 캐싱 최적화 옵션). 트렌드 점수 정기 갱신은 APScheduler 배치(계획).
- **로그아웃 vs 회원 탈퇴**: 로그아웃은 클라이언트 `supabase.auth.signOut()`(백엔드 불필요), 회원 탈퇴는 service-role admin 삭제가 필요해 백엔드 `DELETE /auth/me` 전용. 소셜 로그인 콜백도 Supabase 클라이언트가 처리.
- **버전 관리**: URL 경로 버전(`/v1`). 하위 호환 깨지는 변경은 `/v2`로 분리.
