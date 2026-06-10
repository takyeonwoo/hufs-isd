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

## 파일 구조

### 프론트엔드 `isd-frontend/`
```
isd-frontend/
├── index.html                 # Vite 진입 HTML
├── vite.config.js             # Vite 설정 (envDir: ".." → 루트 .env 사용)
├── tailwind.config.js         # Tailwind 디자인 토큰(색/폰트)
├── postcss.config.js
├── package.json
└── src/
    ├── main.jsx               # 앱 진입점 (React 렌더 + BrowserRouter)
    ├── App.jsx                # 라우트 정의 (/ /map /dashboard /login /apply /admin ...)
    ├── index.css              # Tailwind · 전역 스타일
    ├── pages/                 # 화면(라우트) 단위 컴포넌트
    │   ├── Home.jsx           #   트렌드 홈 (랭킹·인기검색어·주변매장)
    │   ├── Map.jsx            #   지도 (트렌드 필터·마커·매장 상세 팝오버)
    │   ├── Dashboard.jsx      #   사장님 대시보드 (KPI·재고·공지·분석)
    │   ├── Login.jsx          #   사장님 소셜 로그인
    │   ├── AdminLogin.jsx     #   관리자 로그인
    │   ├── Apply.jsx          #   입점 신청 (사업자등록증 업로드 + 제출)
    │   ├── ApplyComplete.jsx  #   신청 완료 / 내 신청 현황
    │   └── AdminApplications.jsx  # 입점 심사 (목록·상세·승인·반려)
    ├── components/            # 재사용 UI 조각
    │   ├── TopNav.jsx         #   상단 내비게이션
    │   ├── TrendCard.jsx      #   트렌드 랭킹 카드 (상품 사진/이모지)
    │   ├── StoreCard.jsx      #   매장 카드
    │   ├── StockPill.jsx · TrendPill.jsx       # 재고/트렌드 배지
    │   ├── PrimaryButton.jsx · GhostButton.jsx # 버튼
    │   └── DeleteStoreModal.jsx · WithdrawModal.jsx  # 매장 삭제/회원 탈퇴 모달
    └── lib/                   # 외부 연동 · 유틸
        ├── api.js             #   백엔드 HTTP 클라이언트 (get/post/patch/del/upload, 봉투 해제)
        ├── supabase.js        #   Supabase 클라이언트 (인증)
        ├── naverMap.js        #   네이버 지도 스크립트 동적 로더
        └── analytics.js       #   손님 익명 이벤트 로그 전송 (visitor_id)
```

### 백엔드 `isd-backend/`
```
isd-backend/
├── requirements.txt
├── .env.example               # 환경변수 템플릿 (복사해서 .env 작성)
└── app/
    ├── main.py                # FastAPI 앱 · CORS · /v1 라우터 마운트 · 에러 핸들러
    ├── core/                  # 공통 부품
    │   ├── config.py          #   .env 설정 (pydantic-settings)
    │   ├── supabase.py        #   Supabase 클라이언트 (service-role / anon)
    │   ├── deps.py            #   인증·권한 의존성 (get_current_user / require_owner / require_admin)
    │   ├── responses.py       #   공통 응답봉투 ok() · ApiError · 페이지네이션
    │   ├── storage.py         #   Supabase Storage 업로드 (사업자등록증·상품 이미지)
    │   └── geocode.py         #   주소 → 위경도 지오코딩
    ├── routers/               # 도메인별 엔드포인트 (URL→동작)  ※번호 = API_SPEC
    │   ├── auth.py            #   §3 인증 (1~3, 34 탈퇴)
    │   ├── trends.py          #   §4 트렌드 (4~6)
    │   ├── stores.py          #   §5 매장 (7~10, 35 삭제)
    │   ├── products.py        #   §6 상품·재고 (11~16)
    │   ├── notices.py         #   §7 공지 (17~20)
    │   ├── applications.py    #   §8 입점 신청 (21~26)
    │   ├── uploads.py         #   §8 파일 업로드 (27, 33)
    │   ├── analytics.py       #   §9 분석 로그/집계 (28~31)
    │   └── admin.py           #   §9 심사 KPI (32)
    └── schemas/               # Pydantic 요청/응답 모델 (데이터 검증)
        ├── common.py          #   공통 enum · 페이지네이션 파라미터
        └── auth.py · stores.py · products.py · notices.py · applications.py · analytics.py
```

### 공통 `db/` · `docs/`
```
db/
├── schema.sql                 # 9개 테이블 DDL
├── seed.sql                   # 데모 데이터
├── reset_seed.sql             # 시드 초기화(재실행용)
└── auth_owners_trigger.sql    # Supabase auth.users → owners 동기화 트리거
docs/
├── API_SPEC.md                # REST API 명세 (35개 엔드포인트)
├── ERD.drawio · ERD.png       # 데이터 모델(ERD)
├── System Architecture.png · Sequence Diagram.png   # 아키텍처/시퀀스 다이어그램
└── UI.pen                     # UI 디자인 시안
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
- [docs/SEQUENCE_FILES.md](docs/SEQUENCE_FILES.md) — 시퀀스 다이어그램 ↔ 코드 파일/함수 매핑
- [db/schema.sql](db/schema.sql) — DB 스키마 (9개 테이블)
- [isd-backend/README.md](isd-backend/README.md) — 백엔드 상세
