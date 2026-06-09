import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, FileText, Check, X, ChevronDown, Download, LogOut } from "lucide-react";
import { api } from "../lib/api.js";

/* ---------- status pill ---------- */
const STATUS = {
  PENDING: { label: "대기중", color: "#F5A524", bg: "#FFF3D8" },
  APPROVED: { label: "승인", color: "#22A06B", bg: "#E6F6EF" },
  REJECTED: { label: "반려", color: "#FF3D3D", bg: "#FEE7E7" },
};

function StatusPill({ s }) {
  const v = STATUS[s] || STATUS.PENDING;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1" style={{ backgroundColor: v.bg }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: v.color }} />
      <span className="font-body text-[11px] font-bold" style={{ color: v.color }}>{v.label}</span>
    </span>
  );
}

const PAGE_SIZE = 6;
const emojiByName = (n = "") => (n.includes("우베") ? "🟣" : n.includes("초콜릿") ? "🍫" : n.includes("푸딩") ? "🍮" : "🏪");

function fmtDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const p = (x) => String(x).padStart(2, "0");
  return `${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

/* ---------- nav ---------- */
function AdminNav() {
  const navigate = useNavigate();
  const logout = () => {
    api.clearAdminToken();
    navigate("/admin/login");
  };
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
        <span className="font-body text-xs font-medium text-[#B0B0B0]">admin</span>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent font-body text-xs font-bold text-fg-inverse">A</span>
        <button onClick={logout} title="로그아웃" className="flex items-center gap-1 rounded-full bg-[#2A2A2A] px-3 py-1.5 font-body text-[11px] font-semibold text-[#B0B0B0]">
          <LogOut size={12} /> 로그아웃
        </button>
      </div>
    </header>
  );
}

/* ---------- table ---------- */
function Table({ rows, total, page, onPage, onSelect, onApprove, onReject, selectedId }) {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);
  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-2xl bg-surface-primary">
      <div className="flex items-center bg-surface-secondary px-6 py-3.5 font-body text-[11px] font-bold text-fg-muted">
        <span className="w-[220px]">매장명</span>
        <span className="w-[130px]">사업자번호</span>
        <span className="w-[110px]">신청자</span>
        <span className="w-[100px]">신청일</span>
        <span className="w-20">서류</span>
        <span className="w-[100px]">상태</span>
        <span className="flex-1 text-right">액션</span>
      </div>

      {rows.length === 0 && <div className="px-6 py-10 text-center font-body text-xs text-fg-muted">신청 내역이 없습니다.</div>}

      {rows.map((r) => (
        <div
          key={r.application_id}
          onClick={() => onSelect(r.application_id)}
          className="flex cursor-pointer items-center px-6 py-4"
          style={{ backgroundColor: r.application_id === selectedId ? "#F7F4FF" : "#FFFFFF" }}
        >
          <div className="flex w-[220px] items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-secondary text-base">{emojiByName(r.cafe_name)}</span>
            <div className="flex flex-col gap-0.5">
              <span className="font-body text-[13px] font-bold text-fg-primary">{r.cafe_name}</span>
              <span className="font-body text-[11px] text-fg-muted">{r.address}</span>
            </div>
          </div>
          <span className="w-[130px] font-data text-xs font-semibold text-fg-primary">{r.business_reg_no}</span>
          <span className="w-[110px] font-body text-xs font-semibold text-fg-primary">{r.applicant_name ?? "-"}</span>
          <span className="w-[100px] font-data text-xs text-fg-secondary">{fmtDate(r.submitted_at)}</span>
          <span className="flex w-20 items-center gap-1.5">
            <FileText size={13} className="text-accent" />
            <span className="font-body text-[11px] font-bold text-accent">확인</span>
          </span>
          <div className="w-[100px]"><StatusPill s={r.status} /></div>
          <div className="flex flex-1 justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
            {r.status === "PENDING" ? (
              <>
                <button onClick={() => onApprove(r.application_id)} className="flex h-[30px] items-center justify-center gap-1 rounded-full bg-accent px-3">
                  <Check size={11} className="text-fg-inverse" />
                  <span className="font-body text-[11px] font-bold text-fg-inverse">승인</span>
                </button>
                <button onClick={() => onReject(r.application_id)} className="flex h-[30px] items-center justify-center gap-1 rounded-full bg-surface-secondary px-3">
                  <X size={11} className="text-fg-secondary" />
                  <span className="font-body text-[11px] font-bold text-fg-secondary">반려</span>
                </button>
              </>
            ) : (
              <button onClick={() => onSelect(r.application_id)} className="flex h-[30px] items-center justify-center rounded-full bg-surface-secondary px-3 font-body text-[11px] font-bold text-fg-secondary">
                상세보기
              </button>
            )}
          </div>
        </div>
      ))}

      <div className="flex items-center justify-between bg-surface-secondary px-6 py-4">
        <span className="font-body text-[11px] font-semibold text-fg-muted">{from}-{to} / {total}건</span>
        <div className="flex items-center gap-1">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => onPage(p)}
              className={"flex h-7 w-7 items-center justify-center rounded-full font-data text-[11px] font-bold " + (p === page ? "bg-accent text-fg-inverse" : "bg-surface-primary text-fg-secondary")}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- detail side panel ---------- */
function DetailPanel({ detail, onApprove, onReject }) {
  const [reason, setReason] = useState("");
  useEffect(() => { setReason(""); }, [detail?.application_id]);

  if (!detail) {
    return (
      <aside className="flex w-[380px] flex-col items-center justify-center rounded-2xl bg-surface-primary p-6">
        <span className="font-body text-xs text-fg-muted">왼쪽에서 신청을 선택하세요.</span>
      </aside>
    );
  }

  const info = [
    { k: "신청자", v: detail.applicant_name ?? "-" },
    { k: "이메일", v: detail.email ?? "-" },
    { k: "연락처", v: detail.phone ?? "-", mono: true },
    { k: "사업자번호", v: detail.business_reg_no ?? "-", mono: true },
    { k: "신청일시", v: fmtDate(detail.submitted_at), mono: true },
  ];

  return (
    <aside className="flex w-[380px] flex-col gap-[18px] rounded-2xl bg-surface-primary p-6">
      <div className="flex w-full items-center justify-between">
        <div className="flex flex-col gap-1">
          <h3 className="font-heading text-base font-bold text-fg-primary">신청 상세</h3>
          <span className="font-data text-[11px] text-fg-muted">#APP-{detail.application_id}</span>
        </div>
        <StatusPill s={detail.status} />
      </div>

      <div className="flex w-full items-center gap-3 rounded-xl bg-surface-secondary p-3.5">
        <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-surface-warm text-[22px]">{emojiByName(detail.cafe_name)}</span>
        <div className="flex flex-col gap-1">
          <span className="font-heading text-[15px] font-bold text-fg-primary">{detail.cafe_name}</span>
          <span className="font-body text-[11px] font-medium text-fg-secondary">{detail.address}</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {info.map((d) => (
          <div key={d.k} className="flex w-full items-center justify-between">
            <span className="font-body text-[11px] font-semibold text-fg-muted">{d.k}</span>
            <span className={(d.mono ? "font-data" : "font-body") + " text-xs font-semibold text-fg-primary"}>{d.v}</span>
          </div>
        ))}
        {/* 네이버 플레이스 — 승인 전 더블체크용 (클릭하면 새 탭에서 열림) */}
        <div className="flex w-full items-center justify-between">
          <span className="font-body text-[11px] font-semibold text-fg-muted">네이버 플레이스</span>
          {detail.naver_place_url ? (
            <a href={detail.naver_place_url} target="_blank" rel="noreferrer" className="max-w-[210px] truncate font-body text-xs font-semibold text-accent underline">
              링크 열어 확인 ↗
            </a>
          ) : (
            <span className="font-body text-xs font-semibold text-fg-muted">미입력</span>
          )}
        </div>
      </div>

      <div className="h-px w-full bg-border-soft" />

      <div className="flex w-full items-center justify-between">
        <span className="font-body text-[13px] font-bold text-fg-primary">사업자등록증</span>
        {detail.business_license_url && (
          <a href={detail.business_license_url} target="_blank" rel="noreferrer" className="flex items-center gap-1">
            <Download size={12} className="text-accent" />
            <span className="font-body text-[11px] font-bold text-accent">다운로드</span>
          </a>
        )}
      </div>
      <a
        href={detail.business_license_url || "#"}
        target="_blank"
        rel="noreferrer"
        className="flex h-[180px] w-full flex-col items-center justify-center gap-2 rounded-xl bg-surface-secondary"
      >
        <FileText size={36} className="text-fg-muted" />
        <span className="font-data text-[11px] font-semibold text-fg-secondary">사업자등록증</span>
        <span className="font-body text-[11px] font-bold text-accent">클릭하여 미리보기</span>
      </a>

      {detail.status === "PENDING" ? (
        <>
          <div className="flex flex-col gap-2 rounded-xl bg-surface-secondary p-3.5">
            <span className="font-body text-[11px] font-semibold text-fg-muted">반려 사유 (반려 시 필수)</span>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="반려 시 신청자에게 전달될 메모를 작성해주세요."
              className="h-16 w-full resize-none rounded-lg bg-surface-primary px-3 py-2 font-body text-[11px] text-fg-primary outline-none placeholder:text-fg-muted"
            />
          </div>
          <div className="flex w-full gap-2.5">
            <button onClick={() => onReject(detail.application_id, reason)} className="flex h-12 flex-1 items-center justify-center gap-1.5 rounded-full bg-surface-secondary">
              <X size={14} className="text-fg-primary" />
              <span className="font-body text-[13px] font-bold text-fg-primary">반려</span>
            </button>
            <button onClick={() => onApprove(detail.application_id)} className="flex h-12 flex-1 items-center justify-center gap-1.5 rounded-full bg-accent">
              <Check size={14} className="text-fg-inverse" />
              <span className="font-body text-[13px] font-bold text-fg-inverse">승인</span>
            </button>
          </div>
        </>
      ) : (
        detail.status === "REJECTED" && detail.rejection_reason && (
          <div className="flex flex-col gap-1 rounded-xl bg-surface-secondary p-3.5">
            <span className="font-body text-[11px] font-semibold text-fg-muted">반려 사유</span>
            <span className="font-body text-xs text-fg-primary">{detail.rejection_reason}</span>
          </div>
        )
      )}
    </aside>
  );
}

export default function AdminApplications() {
  const [summary, setSummary] = useState(null);
  const [counts, setCounts] = useState({ PENDING: 0, APPROVED: 0, REJECTED: 0 });
  const [tab, setTab] = useState("PENDING");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [detail, setDetail] = useState(null);

  const loadSummary = useCallback(() => {
    api.get("/admin/applications/summary").then(setSummary).catch(() => setSummary(null));
  }, []);

  const load = useCallback(() => {
    const statusQ = tab === "ALL" ? "" : `status=${tab}&`;
    const qQ = q ? `q=${encodeURIComponent(q)}&` : "";
    api.get(`/applications?${statusQ}${qQ}page=${page}&page_size=${PAGE_SIZE}`, { wantMeta: true })
      .then(({ data, meta }) => {
        setRows(data || []);
        setTotal(meta?.total ?? (data || []).length);
      })
      .catch(() => { setRows([]); setTotal(0); });
  }, [tab, q, page]);

  useEffect(() => { loadSummary(); }, [loadSummary]);
  useEffect(() => { load(); }, [load]);

  // 탭 카운트: summary.pending + 상태별 meta.total
  useEffect(() => {
    ["PENDING", "APPROVED", "REJECTED"].forEach((s) => {
      api.get(`/applications?status=${s}&page=1&page_size=1`, { wantMeta: true })
        .then(({ meta }) => setCounts((c) => ({ ...c, [s]: meta?.total ?? 0 })))
        .catch(() => {});
    });
  }, [summary]);

  const select = useCallback((id) => {
    api.get(`/applications/${id}`).then(setDetail).catch(() => setDetail(null));
  }, []);

  const refresh = useCallback(() => { load(); loadSummary(); setDetail(null); }, [load, loadSummary]);

  const approve = useCallback(async (id) => {
    if (!confirm("이 신청을 승인할까요? 매장이 생성됩니다.")) return;
    try { await api.post(`/applications/${id}/approve`); alert("승인되었습니다."); refresh(); }
    catch (e) { alert(`승인 실패: ${e.message}`); }
  }, [refresh]);

  const reject = useCallback(async (id, reasonArg) => {
    const reason = reasonArg ?? prompt("반려 사유를 입력하세요.");
    if (!reason || !reason.trim()) return alert("반려 사유를 입력하세요.");
    try { await api.post(`/applications/${id}/reject`, { rejection_reason: reason.trim() }); alert("반려되었습니다."); refresh(); }
    catch (e) { alert(`반려 실패: ${e.message}`); }
  }, [refresh]);

  const kpis = [
    { label: "대기 중", value: String(summary?.pending ?? 0), unit: "건", sub: "검수 필요", accent: true },
    { label: "오늘 승인", value: String(summary?.approved_today ?? 0), unit: "건", sub: "오늘 처리" },
    { label: "이번 주 반려", value: String(summary?.rejected_this_week ?? 0), unit: "건", sub: "최근 7일" },
    { label: "총 입점 매장", value: String(summary?.total_stores ?? 0), unit: "개", sub: "누적" },
  ];

  const tabs = [
    { key: "PENDING", label: "대기중", count: counts.PENDING },
    { key: "APPROVED", label: "승인", count: counts.APPROVED },
    { key: "REJECTED", label: "반려", count: counts.REJECTED },
    { key: "ALL", label: "전체", count: counts.PENDING + counts.APPROVED + counts.REJECTED },
  ];

  return (
    <div className="flex min-h-screen w-full justify-center bg-surface-secondary">
      <div className="w-full max-w-canvas bg-surface-secondary">
        <AdminNav />
        <main className="flex flex-col gap-6 px-10 pb-10 pt-8">
          <div className="flex w-full items-center justify-between">
            <div className="flex flex-col gap-1.5">
              <h1 className="font-heading text-[28px] font-bold text-fg-primary">입점 신청 관리</h1>
              <p className="font-body text-[13px] text-fg-secondary">사업자등록증을 검수하고 매장을 승인하거나 반려할 수 있어요.</p>
            </div>
            <div className="flex h-10 w-[260px] items-center gap-2 rounded-full border border-border-soft bg-surface-primary px-4">
              <Search size={14} className="text-fg-muted" />
              <input
                value={q}
                onChange={(e) => { setPage(1); setQ(e.target.value); }}
                placeholder="매장명 / 사업자번호 검색"
                className="w-full bg-transparent font-body text-xs text-fg-primary outline-none placeholder:text-fg-muted"
              />
            </div>
          </div>

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

          <div className="flex w-full items-center justify-between rounded-2xl bg-surface-primary px-[18px] py-2.5">
            <div className="flex items-center gap-1.5">
              {tabs.map((t) => {
                const active = t.key === tab;
                return (
                  <button
                    key={t.key}
                    onClick={() => { setPage(1); setTab(t.key); }}
                    className={"flex h-9 items-center gap-1.5 rounded-full px-3.5 " + (active ? "bg-accent" : "bg-surface-secondary")}
                  >
                    <span className={"font-body text-xs font-bold " + (active ? "text-fg-inverse" : "text-fg-secondary")}>{t.label}</span>
                    <span className={"font-data text-[11px] font-bold " + (active ? "text-[#FFD9C2]" : "text-fg-muted")}>{t.count}</span>
                  </button>
                );
              })}
            </div>
            <span className="flex items-center gap-2">
              <span className="font-body text-[11px] font-semibold text-fg-muted">신청일순</span>
              <ChevronDown size={12} className="text-fg-muted" />
            </span>
          </div>

          <div className="flex gap-5">
            <Table
              rows={rows}
              total={total}
              page={page}
              selectedId={detail?.application_id}
              onPage={setPage}
              onSelect={select}
              onApprove={approve}
              onReject={(id) => reject(id)}
            />
            <DetailPanel detail={detail} onApprove={approve} onReject={reject} />
          </div>
        </main>
      </div>
    </div>
  );
}
