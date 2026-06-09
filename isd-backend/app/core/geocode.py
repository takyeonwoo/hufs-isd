"""주소 → 좌표(위경도) 변환 (Kakao Local API).

승인 시 매장 주소를 좌표로 바꿔 지도 마커에 쓴다. 키가 없거나 실패하면 None 반환
(매장은 좌표 없이 생성되고, 추후 매장 정보 수정에서 다시 시도 가능).
"""
import httpx

from app.core.config import settings

_KAKAO_URL = "https://dapi.kakao.com/v2/local/search/address.json"


def geocode(address: str | None) -> tuple[float, float] | None:
    """주소 문자열 → (latitude, longitude). 실패 시 None."""
    if not address or not settings.kakao_rest_api_key:
        return None
    try:
        res = httpx.get(
            _KAKAO_URL,
            params={"query": address},
            headers={"Authorization": f"KakaoAK {settings.kakao_rest_api_key}"},
            timeout=5.0,
        )
        res.raise_for_status()
        docs = res.json().get("documents") or []
        if not docs:
            return None
        doc = docs[0]
        # Kakao: x = 경도(lng), y = 위도(lat)
        return float(doc["y"]), float(doc["x"])
    except Exception:  # noqa: BLE001 — geocoding 실패는 치명적이지 않음
        return None
