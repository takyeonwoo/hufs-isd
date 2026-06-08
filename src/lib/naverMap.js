// 네이버 클라우드 플랫폼 Maps(Web Dynamic Map) 스크립트를 동적으로 로드한다.
// 여러 번 호출돼도 스크립트는 한 번만 삽입되도록 Promise를 캐싱한다.

let loadPromise = null;

export function loadNaverMaps() {
  // 이미 로드 완료된 경우
  if (window.naver?.maps) return Promise.resolve(window.naver.maps);

  // 로드 중이거나 끝난 경우 같은 Promise 재사용
  if (loadPromise) return loadPromise;

  const keyId = import.meta.env.VITE_NAVER_MAP_KEY_ID;

  loadPromise = new Promise((resolve, reject) => {
    if (!keyId || keyId.startsWith("발급받은")) {
      reject(new Error("VITE_NAVER_MAP_KEY_ID 가 .env 에 설정되지 않았습니다."));
      return;
    }

    const script = document.createElement("script");
    // 신버전 NCP Maps 엔드포인트 (ncpKeyId 파라미터)
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${keyId}`;
    script.async = true;
    script.onload = () => resolve(window.naver.maps);
    script.onerror = () => reject(new Error("네이버 지도 스크립트 로드 실패"));
    document.head.appendChild(script);
  });

  return loadPromise;
}
