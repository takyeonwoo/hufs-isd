// FastAPI 백엔드 호출 클라이언트.
// 베이스 URL 은 .env 의 VITE_API_BASE_URL, 없으면 로컬 기본값.
import { supabase } from "./supabase.js";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/v1";
const ADMIN_TOKEN_KEY = "foorendy_admin_token";

// 인증 토큰: 사장님 Supabase 세션을 우선, 없으면 관리자 고정계정 토큰(localStorage).
// (세션 우선이라, 관리자로 로그인했던 토큰이 localStorage 에 남아있어도 사장님 로그인이 가려지지 않는다.)
async function getAuthToken() {
  try {
    const { data } = await supabase.auth.getSession();
    if (data?.session?.access_token) return data.session.access_token;
  } catch {
    /* 세션 조회 실패 시 관리자 토큰으로 폴백 */
  }
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

async function request(path, { method = "GET", body, token, wantMeta = false } = {}) {
  const auth = token ?? (await getAuthToken());
  const res = await fetch(BASE_URL + path, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return wantMeta ? { data: null, meta: null } : null;

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const message = json?.error?.message || `요청 실패 (${res.status})`;
    throw new Error(message);
  }
  // wantMeta: 페이지네이션 등 meta 가 필요한 목록 API 용 → { data, meta } 통째 반환
  if (wantMeta) return { data: json?.data ?? json, meta: json?.meta ?? null };
  return json?.data ?? json;
}

async function upload(path, file, { token } = {}) {
  const auth = token ?? (await getAuthToken());
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(BASE_URL + path, {
    method: "POST",
    headers: auth ? { Authorization: `Bearer ${auth}` } : undefined,
    body: form,
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(json?.error?.message || `업로드 실패 (${res.status})`);
  }
  return json?.data ?? json;
}

export const api = {
  get: (path, opts) => request(path, { ...opts, method: "GET" }),
  post: (path, body, opts) => request(path, { ...opts, method: "POST", body }),
  patch: (path, body, opts) => request(path, { ...opts, method: "PATCH", body }),
  del: (path, opts) => request(path, { ...opts, method: "DELETE" }),
  upload,
  // 관리자 고정계정 토큰 관리 (AdminLogin / 로그아웃에서 사용)
  setAdminToken: (t) => localStorage.setItem(ADMIN_TOKEN_KEY, t),
  clearAdminToken: () => localStorage.removeItem(ADMIN_TOKEN_KEY),
  hasAdminToken: () => !!localStorage.getItem(ADMIN_TOKEN_KEY),
};
