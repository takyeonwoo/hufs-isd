"""Foorendy API 진입점.

실행:  uvicorn app.main:app --reload
문서:  http://localhost:8000/docs
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.responses import ApiError, api_error_handler
from app.routers import (
    admin,
    analytics,
    applications,
    auth,
    notices,
    products,
    stores,
    trends,
    uploads,
)

app = FastAPI(title=settings.project_name, version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(ApiError, api_error_handler)

# /v1 하위에 모든 라우터 마운트
prefix = settings.api_v1_prefix
for r in (auth, trends, stores, products, notices, applications, uploads, analytics, admin):
    app.include_router(r.router, prefix=prefix)


@app.get("/health", tags=["meta"])
async def health():
    return {"status": "ok"}
