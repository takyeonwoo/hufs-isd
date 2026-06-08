import { Link } from "react-router-dom";
import { Flame, Mail, Lock, Eye, Check, ArrowRight } from "lucide-react";

const stats = [
  { label: "등록 매장", value: "312", accent: false },
  { label: "추적 트렌드", value: "24", accent: false },
  { label: "실시간 재고", value: "LIVE", accent: true },
];

export default function Login() {
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

        {/* right form */}
        <div className="flex flex-1 flex-col justify-center bg-surface-primary px-20 py-12">
          <div className="flex w-full flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h2 className="font-heading text-[32px] font-bold text-fg-primary">사장님 로그인</h2>
              <p className="font-body text-[13px] leading-[1.5] text-fg-secondary">매장과 메뉴 재고를 관리하려면 사장님 계정으로 로그인하세요.</p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-body text-xs font-semibold text-fg-secondary">이메일</label>
              <div className="flex h-12 w-full items-center gap-2.5 rounded-xl border border-border-soft bg-surface-primary px-4">
                <Mail size={16} className="text-fg-muted" />
                <input className="flex-1 bg-transparent font-body text-[13px] text-fg-primary outline-none placeholder:text-fg-muted" placeholder="name@foorendy.app" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex w-full items-center justify-between">
                <label className="font-body text-xs font-semibold text-fg-secondary">비밀번호</label>
                <span className="font-body text-[11px] font-semibold text-accent">비밀번호 찾기</span>
              </div>
              <div className="flex h-12 w-full items-center gap-2.5 rounded-xl border border-accent bg-surface-primary px-4">
                <Lock size={16} className="text-accent" />
                <input type="password" defaultValue="password" className="flex-1 bg-transparent font-data text-sm font-semibold text-fg-primary outline-none" />
                <Eye size={16} className="text-fg-muted" />
              </div>
            </div>

            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-[18px] w-[18px] items-center justify-center rounded-md bg-accent">
                  <Check size={12} className="text-fg-inverse" />
                </span>
                <span className="font-body text-xs font-medium text-fg-primary">로그인 상태 유지</span>
              </div>
            </div>

            <button className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-accent">
              <span className="font-body text-sm font-bold text-fg-inverse">로그인</span>
              <ArrowRight size={16} className="text-fg-inverse" />
            </button>

            <div className="flex w-full items-center justify-center gap-1.5">
              <span className="font-body text-xs text-fg-secondary">아직 매장을 등록하지 않으셨나요?</span>
              <Link to="/signup" className="font-body text-xs font-bold text-accent">사장님 회원가입</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
