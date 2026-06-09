import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Flame, ShieldCheck } from "lucide-react";
import { supabase } from "../lib/supabase.js";
import { api } from "../lib/api.js";

const socials = [
  { provider: "google", label: "Google로 로그인", bg: "#FFFFFF", color: "#1A1A1A", border: true, badge: <span className="font-heading text-lg font-bold text-[#4285F4]">G</span> },
  // 카카오: 이메일 + 닉네임 요청 (동의항목에서 account_email·profile_nickname 켜둬야 함)
  { provider: "kakao", label: "Kakao로 로그인", bg: "#FEE500", color: "#1A1A1A", scopes: "account_email profile_nickname", badge: <span className="text-base">💬</span> },
];

export default function Login() {
  const [error, setError] = useState(null);
  const [storeCount, setStoreCount] = useState(null);
  const [trendCount, setTrendCount] = useState(null);

  // (5) 등록 매장 수 / 추적 트렌드 수 실제 데이터
  useEffect(() => {
    api.get("/stores").then((d) => setStoreCount((d || []).length)).catch(() => setStoreCount(null));
    api.get("/trends?limit=100").then((d) => setTrendCount((d || []).length)).catch(() => setTrendCount(null));
  }, []);

  const stats = [
    { label: "등록 매장", value: storeCount != null ? String(storeCount) : "—", accent: false },
    { label: "추적 트렌드", value: trendCount != null ? String(trendCount) : "—", accent: false },
    { label: "실시간 재고", value: "LIVE", accent: true },
  ];

  // 소셜 로그인 → Supabase OAuth (성공 시 세션 발급)
  async function handleSocial(provider, scopes) {
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/apply`,
          ...(scopes ? { scopes } : {}),
        },
      });
      if (error) throw error;
    } catch (e) {
      setError(`${provider} 로그인을 사용할 수 없습니다: ${e.message}`);
    }
  }

  return (
    <div className="flex min-h-screen w-full justify-center bg-surface-primary">
      <div className="flex w-full max-w-canvas">
        {/* left dark hero */}
        <div className="flex w-[720px] flex-col justify-between bg-surface-inverse p-16">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent">
              <Flame size={20} className="text-fg-inverse" />
            </div>
            <span className="font-heading text-2xl font-bold text-fg-inverse">Foorendy</span>
          </div>

          <div className="flex flex-col gap-6">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#1F1F1F] px-3.5 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              <span className="font-body text-[11px] font-semibold text-fg-inverse">Trendy Food Map for ISD 2026</span>
            </span>
            <h1 className="whitespace-pre-line font-heading text-[44px] font-bold leading-[1.15] text-fg-inverse">
              {"내 매장 재고와\n트렌드 노출을\n한 화면에서 관리."}
            </h1>
            <p className="font-body text-sm leading-[1.6] text-[#B0B0B0]">
              트렌드 음식과 매장 재고 데이터를 연결해서, 손님이 찾는 메뉴를 놓치지 않도록 도와드려요.
            </p>
            <div className="flex gap-4 pt-4">
              {stats.map((s) => (
                <div key={s.label} className="flex flex-1 flex-col gap-1 rounded-xl bg-[#1F1F1F] p-[18px]">
                  <span className="font-body text-[11px] text-[#888888]">{s.label}</span>
                  <span className={"font-data text-[22px] font-bold " + (s.accent ? "text-accent" : "text-fg-inverse")}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="font-body text-[11px] font-semibold text-fg-inverse">Team Foorendy · Food + Trendy</span>
            <span className="font-body text-[11px] text-[#888888]">ISD 팀 프로젝트 · 2026.05</span>
          </div>
        </div>

        {/* right — social login */}
        <div className="flex flex-1 flex-col justify-center bg-surface-primary px-20 py-12">
          <div className="flex w-full flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h2 className="font-heading text-[32px] font-bold text-fg-primary">사장님 로그인</h2>
              <p className="font-body text-[13px] leading-[1.5] text-fg-secondary">소셜 계정으로 매장을 관리하세요.</p>
            </div>

            {socials.map((s) => (
              <button
                key={s.label}
                onClick={() => handleSocial(s.provider, s.scopes)}
                className="flex h-14 w-full items-center justify-center gap-2.5 rounded-full"
                style={{ backgroundColor: s.bg, color: s.color, border: s.border ? "1px solid #EDEEF1" : "none" }}
              >
                {s.badge}
                <span className="font-body text-sm font-bold" style={{ color: s.color }}>{s.label}</span>
              </button>
            ))}

            {error && <p className="font-body text-[12px] font-semibold text-[#C0392B]">{error}</p>}

            <div className="flex items-center gap-3 py-3">
              <span className="h-px flex-1 bg-border-soft" />
              <span className="font-body text-[11px] font-medium text-fg-muted">안전한 소셜 로그인</span>
              <span className="h-px flex-1 bg-border-soft" />
            </div>

            <Link
              to="/admin/login"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-surface-inverse"
            >
              <ShieldCheck size={14} className="text-fg-inverse" />
              <span className="font-body text-[13px] font-bold text-fg-inverse">관리자(Admin) 로그인</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
