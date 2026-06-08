# hufs-isd

team project at hufs ime isd class — **Foorendy** (Food + Trendy)

모노레포 구조:

```
hufs-isd/
├── isd-frontend/   # React + Vite + Tailwind (지도/대시보드/입점신청/심사 화면)
└── isd-backend/    # FastAPI · Supabase · Redis · APScheduler (REST API)
```

## 프론트엔드

```bash
cd isd-frontend
npm install
npm run dev        # http://localhost:5173
```

환경변수(`isd-frontend/.env`): `VITE_NAVER_MAP_KEY_ID`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

## 백엔드

```bash
cd isd-backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload   # http://localhost:8000/docs
```

자세한 내용은 [isd-backend/README.md](isd-backend/README.md) 참고.

## 문서

- [API_SPEC.md](../API_SPEC.md) — REST API 명세 (32개 엔드포인트)
- [schema.sql](../schema.sql) — DB 스키마 (9개 테이블)
