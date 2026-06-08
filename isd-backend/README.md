# Foorendy Backend (isd-backend)

FastAPI · PostgreSQL(Supabase) · Redis · APScheduler

[API_SPEC.md](../../API_SPEC.md) 의 32개 엔드포인트를 리소스별 라우터로 구현하는 스캐폴드입니다.
현재 각 핸들러는 요청 검증 + 응답 봉투 형태까지 갖춰져 있고, 실제 DB 연동 지점은 `# TODO` 로 표시돼 있습니다.

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
    ├── auth.py          # §3  (1~3)
    ├── trends.py        # §4  (4~6)
    ├── stores.py        # §5  (7~10)
    ├── products.py      # §6  (11~16) · 재고
    ├── notices.py       # §7  (17~20)
    ├── applications.py  # §8  (21~26)
    ├── uploads.py       # §8  (27)
    ├── analytics.py     # §9  (28~31)
    └── admin.py         # §9  (32)
```

## 다음 단계 (구현 TODO)

- 각 라우터의 `# TODO` 지점에 Supabase 쿼리 연결
- 재고 변경 시 `inventory_logs` 자동 기록 트랜잭션
- 입점 승인 시 `stores` 생성 단일 트랜잭션
- Redis 인기 검색어 집계 + APScheduler 트렌드 점수 배치
- Supabase Storage 연동(사업자등록증 업로드)
