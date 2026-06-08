// 손님(익명) 행동 이벤트 로그 — (28) POST /analytics/events
// 분석 실패가 화면을 망치면 안 되므로 fire-and-forget(에러 무시)로 쏜다.

import { api } from "./api.js";

// 익명 방문자 식별자 — localStorage 에 한 번 생성해 재사용
function visitorId() {
  const KEY = "foorendy_visitor_id";
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = (crypto?.randomUUID?.() ?? `v_${Date.now()}_${Math.random().toString(36).slice(2)}`);
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return "anonymous";
  }
}

/**
 * 이벤트 1건 전송. (실패해도 조용히 무시)
 * @param {"VIEW_STORE"|"SEARCH_TREND"|"CLICK_MARKER"} eventType
 * @param {{store_id?:number, product_id?:number, trend_id?:number}} [target]
 */
export function logEvent(eventType, target = {}) {
  const body = { visitor_id: visitorId(), event_type: eventType, ...target };
  Promise.resolve()
    .then(() => api.post("/analytics/events", body))
    .catch(() => {});
}

export default logEvent;
