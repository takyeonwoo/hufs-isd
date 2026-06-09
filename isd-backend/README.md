# Foorendy Backend (isd-backend)

FastAPI · PostgreSQL(Supabase)

[docs/API_SPEC.md](../docs/API_SPEC.md) 의 35개 엔드포인트를 리소스별 라우터로 구현한다.
모든 핸들러가 Supabase 와 실제 연동되어 동작한다(목록·생성·수정·삭제·집계, 재고 자동화, 입점 승인→매장 생성, 분석 집계).

## 빠른 시작

```bash
cd isd-backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # 값 채우기

uvicorn app.main:app --reload
```

- API 문서(Swagger): http://localhost:8000/docs
- 헬스체크: http://localhost:8000/health
- 모든 엔드포인트는 `/v1` 하위에 마운트됩니다. 예) `GET /v1/trends`

> `.env` 의 `DEV_FAKE_AUTH=true` 면 토큰 없이도 가짜 사장님/심사자로 통과하므로 로컬에서 보호된 엔드포인트를 바로 테스트할 수 있습니다. 운영 배포 시 반드시 `false`.

## 구조

```
app/
├── main.py              # FastAPI 앱 · CORS · 라우터 마운트 · 에러 핸들러
├── core/
│   ├── config.py        # .env 설정 (pydantic-settings)
│   ├── supabase.py      # Supabase 클라이언트 (service / anon)
│   ├── deps.py          # 인증 의존성 (get_current_user / require_owner / require_admin)
│   └── responses.py     # 공통 응답 봉투 · ApiError · 페이지네이션
├── schemas/             # Pydantic 요청 모델 + enum
└── routers/             # 리소스별 라우터
    ├── auth.py          # §3  내 프로필 · 회원 탈퇴(34)
    ├── trends.py        # §4  랭킹(4) · 상세(5) · 인기검색어 집계(6)
    ├── stores.py        # §5  목록/상세/내매장/수정/삭제(7~10,35)
    ├── products.py      # §6  목록/등록/수정/재고변경/삭제/이력(11~16) · 재고 자동화
    ├── notices.py       # §7  공지 CRUD(17~20)
    ├── applications.py  # §8  신청/현황/심사/승인→매장생성/반려(21~26)
    ├── uploads.py       # §8  사업자등록증(27) · 상품 이미지(33)
    ├── analytics.py     # §9  이벤트 수집/KPI/시계열/로그(28~31)
    └── admin.py         # §9  심사 KPI(32)
```

## 구현 특징

- **재고 자동화**: 수량 변경 시 `inventory_logs` 자동 기록 + `stock_status`/`stock_updated_at` 갱신
- **입점 승인**: 승인 시 `stores` 자동 생성 후 신청서 상태 갱신
- **인기 검색어**: `analytics_logs`의 `SEARCH_TREND` 이벤트를 윈도우별 DB 집계 (Redis 불필요)
- **업로드**: Supabase Storage 공개 버킷(`business-licenses`, `product-images`)
- **인증**: 로그인/로그아웃은 클라이언트 Supabase SDK, 회원 탈퇴는 service-role 백엔드(`DELETE /auth/me`)
