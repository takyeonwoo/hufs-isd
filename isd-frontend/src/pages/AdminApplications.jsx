import { Search, FileText, Check, X, ChevronDown, Download } from "lucide-react";

/* ---------- status pill ---------- */
const STATUS = {
  pending: { label: "대기중", color: "#F5A524", bg: "#FFF3D8" },
  approved: { label: "승인", color: "#22A06B", bg: "#E6F6EF" },
  rejected: { label: "반려", color: "#FF3D3D", bg: "#FEE7E7" },
};

function StatusPill({ s }) {
  const v = STATUS[s];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1" style={{ backgroundColor: v.bg }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: v.color }} />
      <span className="font-body text-[11px] font-bold" style={{ color: v.color }}>{v.label}</span>
    </span>
  );
}

/* ---------- data ---------- */
const kpis = [
  { label: "대기 중", value: "12", unit: "건", sub: "검수 필요", accent: true },
  { label: "오늘 승인", value: "5", unit: "건", sub: "어제 대비 +2" },
  { label: "이번 주 반려", value: "2", unit: "건", sub: "서류 미비" },
  { label: "총 입점 매장", value: "127", unit: "건", sub: "전월 대비 +18" },
];

const tabs = [
  { label: "대기중", count: "12", active: true },
  { label: "승인", count: "115" },
  { label: "반려", count: "8" },
  { label: "전체", count: "135" },
];

const rows = [
  { emoji: "🟣", thumb: "#F3D9FF", name: "연남 우베하우스", region: "서울 마포구", biz: "123-45-67890", applicant: "김연남", date: "06.07 14:32", status: "pending", selected: true },
  { emoji: "🥛", thumb: "#F3D9FF", name: "성수 우베 라떼바", region: "서울 성동구", biz: "234-56-78901", applicant: "이성수", date: "06.07 11:08", status: "pending" },
  { emoji: "🥐", thumb: "#FFF3D8", name: "망원 우베 베이커리", region: "서울 마포구", biz: "345-67-89012", applicant: "박망원", date: "06.06 18:45", status: "pending" },
  { emoji: "🍰", thumb: "#F0F0F0", name: "합정 디저트연구소", region: "서울 마포구", biz: "456-78-90123", applicant: "최합정", date: "06.06 09:21", status: "approved" },
  { emoji: "🍮", thumb: "#FFE5E5", name: "이대 우베 푸딩샵", region: "서울 서대문구", biz: "567-89-01234", applicant: "정이대", date: "06.05 16:02", status: "approved" },
  { emoji: "🍫", thumb: "#FFD9C2", name: "홍대 두바이초콜릿", region: "서울 마포구", biz: "678-90-12345", applicant: "한홍대", date: "06.05 10:18", status: "rejected" },
];

const detailInfo = [
  { k: "신청자", v: "김연남" },
  { k: "이메일", v: "kim@yeonnam.cafe" },
  { k: "연락처", v: "010-1234-5678", mono: true },
  { k: "사업자번호", v: "123-45-67890", mono: true },
  { k: "신청일시", v: "2026.06.07 14:32", mono: true },
];

/* ---------- nav ---------- */
function AdminNav() {
  return (
    <header className="flex h-16 w-full items-center justify-between bg-surface-inverse px-10">
      <div className="flex items-center gap-3.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
          <span className="font-heading text-base font-bold text-fg-inverse">F</span>
        </div>
        <span className="font-heading text-lg font-bold text-fg-inverse">Foorendy</span>
        <span className="rounded-full bg-[#2A2A2A] px-2.5 py-1 font-body text-[10px] font-bold text-accent">ADMIN</span>
      </div>
      <div className="flex items-center gap-3.5">
        <span className="font-body text-xs font-medium text-[#B0B0B0]">admin@foorendy.co</span>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent font-body text-xs font-bold text-fg-inverse">A</span>
      </div>
    </header>
  );
}

/* ---------- table ---------- */
function Table() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-2xl bg-surface-primary">
      {/* header */}
      <div className="flex items-center bg-surface-secondary px-6 py-3.5 font-body text-[11px] font-bold text-fg-muted">
        <span className="w-[220px]">매장명</span>
        <span className="w-[130px]">사업자번호</span>
        <span className="w-[110px]">신청자</span>
        <span className="w-[100px]">신청일</span>
        <span className="w-20">서류</span>
        <span className="w-[100px]">상태</span>
        <span className="flex-1 text-right">액션</span>
      </div>
      {/* rows */}
      {rows.map((r) => (
        <div key={r.biz} className="flex items-center px-6 py-4" style={{ backgroundColor: r.selected ? "#F7F4FF" : "#FFFFFF" }}>
          <div className="flex w-[220px] items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg text-base" style={{ backgroundColor: r.thumb }}>{r.emoji}</span>
            <div className="flex flex-col gap-0.5">
              <span className="font-body text-[13px] font-bold text-fg-primary">{r.name}</span>
              <span className="font-body text-[11px] text-fg-muted">{r.region}</span>
            </div>
          </div>
          <span className="w-[130px] font-data text-xs font-semibold text-fg-primary">{r.biz}</span>
          <span className="w-[110px] font-body text-xs font-semibold text-fg-primary">{r.applicant}</span>
          <span className="w-[100px] font-data text-xs text-fg-secondary">{r.date}</span>
          <span className="flex w-20 items-center gap-1.5">
            <FileText size={13} className="text-accent" />
            <span className="font-body text-[11px] font-bold text-accent">확인</span>
          </span>
          <div className="w-[100px]"><StatusPill s={r.status} /></div>
          <div className="flex flex-1 justify-end gap-1.5">
            {r.status === "pending" ? (
              <>
                <button className="flex h-[30px] items-center justify-center gap-1 rounded-full bg-accent px-3">
                  <Check size={11} className="text-fg-inverse" />
                  <span className="font-body text-[11px] font-bold text-fg-inverse">승인</span>
                </button>
                <button className="flex h-[30px] items-center justify-center gap-1 rounded-full bg-surface-secondary px-3">
                  <X size={11} className="text-fg-secondary" />
                  <span className="font-body text-[11px] font-bold text-fg-secondary">반려</span>
                </button>
              </>
            ) : (
              <button className="flex h-[30px] items-center justify-center rounded-full bg-surface-secondary px-3 font-body text-[11px] font-bold text-fg-secondary">
                상세보기
              </button>
            )}
          </div>
        </div>
      ))}
      {/* footer */}
      <div className="flex items-center justify-between bg-surface-secondary px-6 py-4">
        <span className="font-body text-[11px] font-semibold text-fg-muted">1-6 / 135건</span>
        <div className="flex items-center gap-1">
          {["1", "2", "3", "…", "23"].map((p, i) => (
            <span
              key={i}
              className={"flex h-7 w-7 items-center justify-center rounded-full font-data text-[11px] font-bold " + (p === "1" ? "bg-accent text-fg-inverse" : "bg-surface-primary text-fg-secondary")}
            >
              {p}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- detail side panel ---------- */
function DetailPanel() {
  return (
    <aside className="flex w-[380px] flex-col gap-[18px] rounded-2xl bg-surface-primary p-6">
      <div className="flex w-full items-center justify-between">
        <div className="flex flex-col gap-1">
          <h3 className="font-heading text-base font-bold text-fg-primary">신청 상세</h3>
          <span className="font-data text-[11px] text-fg-muted">#APP-2026-0612</span>
        </div>
        <StatusPill s="pending" />
      </div>

      <div className="flex w-full items-center gap-3 rounded-xl bg-surface-secondary p-3.5">
        <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#F3D9FF] text-[22px]">🟣</span>
        <div className="flex flex-col gap-1">
          <span className="font-heading text-[15px] font-bold text-fg-primary">연남 우베하우스</span>
          <span className="font-body text-[11px] font-medium text-fg-secondary">카페 · 서울 마포구 연남동</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {detailInfo.map((d) => (
          <div key={d.k} className="flex w-full items-center justify-between">
            <span className="font-body text-[11px] font-semibold text-fg-muted">{d.k}</span>
            <span className={(d.mono ? "font-data" : "font-body") + " text-xs font-semibold text-fg-primary"}>{d.v}</span>
          </div>
        ))}
      </div>

      <div className="h-px w-full bg-border-soft" />

      <div className="flex w-full items-center justify-between">
        <span className="font-body text-[13px] font-bold text-fg-primary">사업자등록증</span>
        <span className="flex items-center gap-1">
          <Download size={12} className="text-accent" />
          <span className="font-body text-[11px] font-bold text-accent">다운로드</span>
        </span>
      </div>
      <div className="flex h-[180px] w-full flex-col items-center justify-center gap-2 rounded-xl bg-surface-secondary">
        <FileText size={36} className="text-fg-muted" />
        <span className="font-data text-[11px] font-semibold text-fg-secondary">businessReg_연남우베하우스.pdf</span>
        <span className="font-body text-[11px] font-bold text-accent">클릭하여 미리보기</span>
      </div>

      <div className="flex flex-col gap-2 rounded-xl bg-surface-secondary p-3.5">
        <span className="font-body text-[11px] font-semibold text-fg-muted">반려 사유 (선택)</span>
        <span className="font-body text-[11px] text-fg-muted">반려 시 신청자에게 전달될 메모를 작성해주세요.</span>
      </div>

      <div className="flex w-full gap-2.5">
        <button className="flex h-12 flex-1 items-center justify-center gap-1.5 rounded-full bg-surface-secondary">
          <X size={14} className="text-fg-primary" />
          <span className="font-body text-[13px] font-bold text-fg-primary">반려</span>
        </button>
        <button className="flex h-12 flex-1 items-center justify-center gap-1.5 rounded-full bg-accent">
          <Check size={14} className="text-fg-inverse" />
          <span className="font-body text-[13px] font-bold text-fg-inverse">승인</span>
        </button>
      </div>
    </aside>
  );
}

export default function AdminApplications() {
  return (
    <div className="flex min-h-screen w-full justify-center bg-surface-secondary">
      <div className="w-full max-w-canvas bg-surface-secondary">
        <AdminNav />
        <main className="flex flex-col gap-6 px-10 pb-10 pt-8">
          {/* head */}
          <div className="flex w-full items-center justify-between">
            <div className="flex flex-col gap-1.5">
              <h1 className="font-heading text-[28px] font-bold text-fg-primary">입점 신청 관리</h1>
              <p className="font-body text-[13px] text-fg-secondary">사업자등록증을 검수하고 매장을 승인하거나 반려할 수 있어요.</p>
            </div>
            <div className="flex h-10 w-[260px] items-center gap-2 rounded-full border border-border-soft bg-surface-primary px-4">
              <Search size={14} className="text-fg-muted" />
              <span className="font-body text-xs text-fg-muted">매장명 / 사업자번호 검색</span>
            </div>
          </div>

          {/* kpis */}
          <div className="flex gap-4">
            {kpis.map((k) => (
              <div key={k.label} className="flex flex-1 flex-col gap-2.5 rounded-2xl bg-surface-primary p-6">
                <span className="font-body text-xs font-semibold text-fg-muted">{k.label}</span>
                <div className="flex items-end gap-2">
                  <span className={"font-data text-[28px] font-bold leading-none " + (k.accent ? "text-accent" : "text-fg-primary")}>{k.value}</span>
                  <span className="font-body text-[13px] font-semibold text-fg-muted">{k.unit}</span>
                </div>
                <span className="font-body text-[11px] text-fg-muted">{k.sub}</span>
              </div>
            ))}
          </div>

          {/* tabs */}
          <div className="flex w-full items-center justify-between rounded-2xl bg-surface-primary px-[18px] py-2.5">
            <div className="flex items-center gap-1.5">
              {tabs.map((t) => (
                <span
                  key={t.label}
                  className={"flex h-9 items-center gap-1.5 rounded-full px-3.5 " + (t.active ? "bg-accent" : "bg-surface-secondary")}
                >
                  <span className={"font-body text-xs font-bold " + (t.active ? "text-fg-inverse" : "text-fg-secondary")}>{t.label}</span>
                  <span className={"font-data text-[11px] font-bold " + (t.active ? "text-[#FFD9C2]" : "text-fg-muted")}>{t.count}</span>
                </span>
              ))}
            </div>
            <span className="flex items-center gap-2">
              <span className="font-body text-[11px] font-semibold text-fg-muted">신청일순</span>
              <ChevronDown size={12} className="text-fg-muted" />
            </span>
          </div>

          {/* main */}
          <div className="flex gap-5">
            <Table />
            <DetailPanel />
          </div>
        </main>
      </div>
    </div>
  );
}
