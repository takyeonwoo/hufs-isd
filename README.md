# Foorendy (hufs-isd)

> **Food + Trendy** · HUFS IME 정보시스템개발및실습 팀 프로젝트
> SNS에서 뜨는 음식을 **내 주변 지도**에서 바로 찾고, 사장님은 **실시간 재고·수요**를 관리하는 지도 기반 플랫폼.

손님은 트렌디 푸드 랭킹과 지도에서 판매 매장·재고를 확인하고, 사장님은 대시보드에서 메뉴/재고/공지/분석을 관리하며, 심사자는 입점 신청을 승인·반려한다.

---

## 모노레포 구조

```
hufs-isd/
├── isd-frontend/   # React + Vite + Tailwind (손님/사장님/심사 화면)
├── isd-backend/    # FastAPI + Supabase(PostgreSQL) (REST API)
├── db/             # schema.sql · seed.sql · reset_seed.sql
├── docs/           # API_SPEC.md · ERD · UI.pen
└── .env            # 프론트(Vite) 공용 환경변수  ← 루트에 둔다
```

## 화면 (isd-frontend/src/pages)

| 화면 | 경로 | 설명 |
|------|------|------|
| 트렌드 홈 | `/` | 트렌디 푸드 랭킹 TOP 10, 실시간 인기 검색어, 주변 매장 |
| 지도 | `/map` | 트렌드별 판매 매장 마커·리스트, 거리/가격 정렬, 매장 상세 팝오버 |
| 사장님 대시보드 | `/dashboard` | 매장 전환, KPI·시간대별 조회·트렌드별 조회·이벤트 로그, 메뉴/재고/공지 관리 |
| 로그인 | `/login`, `/admin/login` | Supabase Auth (소셜 OAuth / 관리자 이메일) |
| 입점 신청 | `/apply`, `/apply/complete` | 사업자등록증 업로드 → 신청 제출 → 심사 현황 |
| 입점 심사 | `/admin` | 신청 목록(탭/검색/페이지), 상세, 승인(매장 자동 생성)·반려 |

---

## 빠른 시작

### 1. DB (Supabase SQL Editor)

```sql
-- 순서대로 실행
db/schema.sql      -- 9개 테이블 생성
db/seed.sql        -- 데모 데이터 (재실행 시 reset_seed.sql 먼저)
```

### 2. 백엔드 (포트 8000)

```bash
cd isd-backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # SUPABASE_* 값 채우기
uvicorn app.main:app --reload     # http://localhost:8000/docs
```

`isd-backend/.env`: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `SUPABASE_ANON_KEY`, `SUPABASE_JWT_SECRET`, `DEV_FAKE_AUTH`

> `DEV_FAKE_AUTH=true` 면 토큰 없이 가짜 사장님/심사자로 통과해 로컬에서 바로 테스트 가능. **운영 배포 시 반드시 `false`.**

### 3. 프론트엔드 (포트 5173)

```bash
cd isd-frontend
npm install
npm run dev        # http://localhost:5173
```

Vite는 환경변수를 **모노레포 루트 `.env`** 에서 읽는다 (`vite.config.js`의 `envDir: ".."`).

루트 `.env`: `VITE_NAVER_MAP_KEY_ID`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

---

## 기술 스택

- **프론트**: React 18 · Vite · TailwindCSS · React Router · Naver Maps API · Supabase JS (인증)
- **백엔드**: FastAPI · Supabase Python (PostgreSQL, RLS 우회 service-role) · Pydantic
- **인증**: Supabase Auth(JWT). 로그인/로그아웃은 클라이언트 SDK, 회원 탈퇴는 service-role 백엔드 전용
- **인기 검색어**: `analytics_logs`의 `SEARCH_TREND` 이벤트 DB 집계 (Redis 불필요 — 트래픽 증가 시 ZSET 캐싱으로 확장 가능)

## 문서

- [docs/API_SPEC.md](docs/API_SPEC.md) — REST API 명세 (35개 엔드포인트)
- [db/schema.sql](db/schema.sql) — DB 스키마 (9개 테이블)
- [isd-backend/README.md](isd-backend/README.md) — 백엔드 상세
