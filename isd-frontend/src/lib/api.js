// FastAPI 백엔드 호출 클라이언트.
// 베이스 URL 은 .env 의 VITE_API_BASE_URL, 없으면 로컬 기본값.
import { supabase } from "./supabase.js";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/v1";
const ADMIN_TOKEN_KEY = "foorendy_admin_token";

// 인증 토큰: 관리자 토큰(localStorage)이 있으면 우선, 없으면 Supabase 세션 JWT.
// 사장님 = Supabase OAuth 세션, 관리자 = /auth/admin-login 으로 받은 고정계정 JWT.
async function getAuthToken() {
  const adminToken = localStorage.getItem(ADMIN_TOKEN_KEY);
  if (adminToken) return adminToken;
  try {
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token ?? null;
  } catch {
    return null;
  }
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
