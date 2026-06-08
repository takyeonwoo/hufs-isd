import { Link } from "react-router-dom";
import { Check, ArrowRight } from "lucide-react";
import TopNav from "../components/TopNav.jsx";

const meta = [
  { label: "신청 번호", value: "FOO-2026-002841", mono: true },
  { label: "카페 이름", value: "연남 우베하우스" },
  { label: "이메일", value: "wooyeont@gmail.com", mono: true },
  { label: "접수 일시", value: "2026.05.26 14:32", mono: true },
];

const steps = [
  { n: "1", text: "심사 (영업일 기준 2~3일)", state: "active" },
  { n: "2", text: "승인 후 입점비 결제 안내 (이메일)", state: "next" },
  { n: "3", text: "매장 정보 등록 후 대시보드 사용 시작", state: "todo" },
];

export default function ApplyComplete() {
  return (
    <div className="flex min-h-screen w-full justify-center bg-surface-secondary">
      <div className="flex w-full max-w-canvas flex-col bg-surface-secondary">
        <TopNav active="" />
        <div className="flex flex-1 items-center justify-center px-10 py-10">
          <div className="flex w-[640px] flex-col items-center gap-6 rounded-2xl bg-surface-primary p-12">
            <div className="flex h-[88px] w-[88px] items-center justify-center rounded-full bg-accent-soft">
              <Check size={48} className="text-accent" />
            </div>

            <div className="flex w-full flex-col items-center gap-3">
              <h1 className="text-center font-heading text-[28px] font-bold text-fg-primary">입점 신청이 접수되었어요</h1>
              <p className="whitespace-pre-line text-center font-body text-sm leading-[1.6] text-fg-secondary">
                {"제출하신 사업자등록증 정보를 검토한 뒤,\n영업일 기준 2~3일 이내 결과를 이메일로 안내드릴게요."}
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 rounded-xl bg-surface-secondary p-5">
              {meta.map((m) => (
                <div key={m.label} className="flex w-full items-center justify-between">
                  <span className="font-body text-xs text-fg-muted">{m.label}</span>
                  <span className={(m.mono ? "font-data font-bold" : "font-body font-semibold") + " text-xs text-fg-primary"}>{m.value}</span>
                </div>
              ))}
            </div>

            <div className="flex w-full flex-col gap-2.5 rounded-xl bg-accent-soft p-[18px]">
              <span className="font-body text-xs font-bold text-accent">📌 다음 단계</span>
              {steps.map((s) => {
                const dotCls =
                  s.state === "active" ? "bg-accent text-fg-inverse" :
                  s.state === "next" ? "bg-surface-primary text-accent border border-accent" :
                  "bg-surface-primary text-fg-muted border border-border-soft";
                const txtCls = s.state === "active" ? "text-fg-primary font-semibold" : "text-fg-secondary font-medium";
                return (
                  <div key={s.n} className="flex w-full items-center gap-2.5">
                    <span className={"flex h-5 w-5 items-center justify-center rounded-full font-data text-[10px] font-bold " + dotCls}>{s.n}</span>
                    <span className={"font-body text-xs " + txtCls}>{s.text}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex w-full gap-2">
              <Link to="/" className="flex h-12 flex-1 items-center justify-center rounded-full bg-surface-secondary font-body text-[13px] font-semibold text-fg-primary">
                홈으로 돌아가기
              </Link>
              <Link to="/dashboard" className="flex h-12 flex-1 items-center justify-center gap-1.5 rounded-full bg-accent font-body text-[13px] font-bold text-fg-inverse">
                신청 상태 확인 <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
