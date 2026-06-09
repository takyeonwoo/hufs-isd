import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import TopNav from "../components/TopNav.jsx";
import { api } from "../lib/api.js";

const metaFallback = [
  { label: "신청 번호", value: "FOO-2026-002841", mono: true },
  { label: "카페 이름", value: "연남 우베하우스" },
  { label: "상태", value: "심사 대기" },
  { label: "접수 일시", value: "2026.05.26 14:32", mono: true },
];

const STATUS_LABEL = { PENDING: "심사 대기", APPROVED: "승인 완료", REJECTED: "반려" };

function appNo(id) {
  return id != null ? `FOO-${String(id).padStart(6, "0")}` : "—";
}
function fmtDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

// 신청 상태 → 진행 단계 활성 인덱스
function stepStates(status) {
  const labels = [
    "심사 (영업일 기준 2~3일)",
    "승인 후 입점비 결제 안내 (이메일)",
    "매장 정보 등록 후 대시보드 사용 시작",
  ];
  const active = status === "APPROVED" ? 2 : status === "REJECTED" ? -1 : 0;
  return labels.map((text, i) => ({
    n: String(i + 1),
    text,
    state: i < active ? "done" : i === active ? "active" : i === active + 1 ? "next" : "todo",
  }));
}

export default function ApplyComplete() {
  // (22) 내 신청 현황 — 가장 최근 신청 1건
  const [app, setApp] = useState(null);
  useEffect(() => {
    api.get("/applications/me")
      .then((list) => setApp(Array.isArray(list) && list.length ? list[0] : null))
      .catch(() => setApp(null));
  }, []);

  const meta = app
    ? [
        { label: "신청 번호", value: appNo(app.application_id ?? app.id), mono: true },
        { label: "카페 이름", value: app.cafe_name ?? "—" },
        { label: "상태", value: STATUS_LABEL[app.status] ?? app.status ?? "—" },
        { label: "접수 일시", value: fmtDateTime(app.submitted_at), mono: true },
      ]
    : metaFallback;
  const steps = stepStates(app?.status);

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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
