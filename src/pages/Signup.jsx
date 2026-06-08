import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import TopNav from "../components/TopNav.jsx";

const socials = [
  { label: "Google로 계속하기", bg: "#FFFFFF", color: "#1A1A1A", border: true, badge: <span className="font-heading text-lg font-bold text-[#4285F4]">G</span> },
  { label: "Kakao로 계속하기", bg: "#FEE500", color: "#1A1A1A", badge: <span className="text-base">💬</span> },
  { label: "Naver로 계속하기", bg: "#03C75A", color: "#FFFFFF", badge: <span className="font-heading text-sm font-bold text-fg-inverse">N</span> },
];

export default function Signup() {
  return (
    <div className="flex min-h-screen w-full justify-center bg-surface-secondary">
      <div className="flex w-full max-w-canvas flex-col bg-surface-secondary">
        <TopNav active="" />
        <div className="flex flex-1 items-center justify-center px-10 py-12">
          <div className="flex w-[640px] flex-col gap-6 rounded-2xl bg-surface-primary p-12">
            <div className="flex flex-col items-center gap-2.5">
              <h1 className="font-heading text-[30px] font-bold text-fg-primary">사장님 회원가입</h1>
              <p className="text-center font-body text-[13px] text-fg-secondary">Google 또는 Kakao 계정으로 간편하게 시작하세요.</p>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              {socials.map((s) => (
                <button
                  key={s.label}
                  className="flex h-14 w-full items-center justify-center gap-2.5 rounded-full"
                  style={{ backgroundColor: s.bg, color: s.color, border: s.border ? "1px solid #EDEEF1" : "none" }}
                >
                  {s.badge}
                  <span className="font-body text-sm font-bold" style={{ color: s.color }}>{s.label}</span>
                </button>
              ))}

              <div className="flex items-center gap-3 py-3">
                <span className="h-px flex-1 bg-border-soft" />
                <span className="font-body text-[11px] font-medium text-fg-muted">안전한 소셜 로그인</span>
                <span className="h-px flex-1 bg-border-soft" />
              </div>

              <div className="flex items-center gap-2 p-1">
                <ShieldCheck size={14} className="text-fg-muted" />
                <span className="font-body text-[11px] leading-[1.5] text-fg-muted">
                  가입 후 매장 정보와 사업자등록증은 입점 신청 단계에서 등록합니다.
                </span>
              </div>

              <div className="flex w-full items-center justify-center gap-1.5 pt-3">
                <span className="font-body text-xs text-fg-secondary">이미 가입하셨나요?</span>
                <Link to="/login" className="font-body text-xs font-bold text-accent">사장님 로그인</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
