import { useState, useEffect, useRef, useCallback } from "react";
import {
  ChevronDown, Eye, Search, Package, TrendingUp, ArrowUp, ArrowDown, Flame, Plus, Minus,
  Trash2, Calendar, MousePointerClick, UserX, ImagePlus, LogOut, Pencil, Check, X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import TopNav from "../components/TopNav.jsx";
import DeleteStoreModal from "../components/DeleteStoreModal.jsx";
import WithdrawModal from "../components/WithdrawModal.jsx";
import { api } from "../lib/api.js";
import { supabase } from "../lib/supabase.js";

/* ---------- helpers ---------- */
function timeAgo(iso) {
  if (!iso) return "";
  const sec = (Date.now() - new Date(iso).getTime()) / 1000;
  if (sec < 60) return "방금";
  if (sec < 3600) return `${Math.floor(sec / 60)}분 전`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}시간 전`;
  return `${Math.floor(sec / 86400)}일 전`;
}
const won = (n) => (n == null ? "-" : Number(n).toLocaleString());

/* ---------- KPI ---------- */
function KpiCard({ title, icon: Icon, value, unit, sub, pill, dark }) {
  return (
    <div className={"flex flex-1 flex-col justify-between gap-3.5 rounded-2xl p-6 " + (dark ? "bg-surface-inverse" : "bg-surface-primary")}>
      <div className="flex w-full items-center justify-between">
        <span className={"font-body text-xs font-semibold " + (dark ? "text-[#B0B0B0]" : "text-fg-muted")}>{title}</span>
        <Icon size={16} className="text-accent" />
      </div>
      <div className="flex w-full items-end gap-2">
        <span className={"font-data text-[34px] font-bold leading-none " + (dark ? "text-fg-inverse" : "text-fg-primary")}>{value}</span>
        {unit && <span className="font-body text-sm font-semibold text-fg-muted">{unit}</span>}
        {pill && (
          <span className="mb-1 inline-flex items-center gap-1 rounded-full px-2 py-[3px]" style={{ backgroundColor: pill.bg }}>
            <pill.icon size={10} style={{ color: pill.color }} />
            <span className="font-data text-[10px] font-bold" style={{ color: pill.color }}>{pill.label}</span>
          </span>
        )}
      </div>
      <span className={"font-body text-[11px] " + (dark ? "text-[#B0B0B0]" : "text-fg-muted")}>{sub}</span>
    </div>
  );
}

function buildKpis(summary) {
  const s = summary || {};
  const up = (s.store_views_change_pct ?? 0) >= 0;
  const scoreUp = (s.trend_score_change_pct ?? 0) >= 0;
  return [
    {
      title: "오늘 매장 조회수", icon: Eye, value: won(s.store_views_today ?? 0),
      sub: `어제 대비 ${(s.store_views_delta ?? 0) >= 0 ? "+" : ""}${s.store_views_delta ?? 0}`,
      pill: {
        label: `${up ? "+" : ""}${s.store_views_change_pct ?? 0}%`,
        color: up ? "#22A06B" : "#FF3D3D", bg: up ? "#E6F6EF" : "#FFE5E5", icon: up ? ArrowUp : ArrowDown,
      },
    },
    s.search_entry_trend
      ? {
          title: "인기 검색어 진입", icon: Search,
          value: `${s.search_entry_trend.name} #${s.search_entry_trend.rank ?? "-"}`,
          sub: "검색 → 우리 매장 노출", pill: { label: "HOT", color: "#FF3D3D", bg: "#FFE5E5", icon: Flame },
        }
      : { title: "인기 검색어 진입", icon: Search, value: "-", sub: "데이터 없음" },
    {
      title: "오늘 재고 변경", icon: Package, value: String(s.stock_changes_today ?? 0), unit: "건",
      sub: s.last_stock_update ? `마지막 업데이트 ${timeAgo(s.last_stock_update)}` : "변경 없음",
    },
    {
      title: "트렌드 점수", icon: TrendingUp, value: s.trend_score != null ? String(s.trend_score) : "-",
      sub: s.trend_percentile != null ? `상위 ${s.trend_percentile}위 매장` : "데이터 없음", dark: true,
      pill: s.trend_score_change_pct != null
        ? { label: `${scoreUp ? "+" : ""}${s.trend_score_change_pct}%`, color: "#5BE49F", bg: "#1F3D2F", icon: scoreUp ? ArrowUp : ArrowDown }
        : undefined,
    },
  ];
}

/* ---------- Inventory ---------- */
const AVAIL = { label: "판매중", color: "#22A06B", bg: "#E6F6EF" };
const LOW = { label: "품절임박", color: "#F5A524", bg: "#FFF3D8" };
const OUT = { label: "품절", color: "#888888", bg: "#F7F8FA" };
const PILL_BY_STATUS = { AVAILABLE: AVAIL, LOW, SOLD_OUT: OUT };

function QtyBox({ qty, onDelta, onSet, busy }) {
  const bg = qty <= 0 ? "#F7F8FA" : qty <= 5 ? "#FFF3D8" : "#F7F8FA";
  const [text, setText] = useState(String(qty));
  // 외부(±버튼 등)에서 qty 가 바뀌면 입력칸도 동기화
  useEffect(() => { setText(String(qty)); }, [qty]);

  const commit = () => {
    const v = parseInt(text, 10);
    if (Number.isNaN(v) || v === qty) { setText(String(qty)); return; }
    onSet?.(Math.max(0, v));
  };

  return (
    <span className="inline-flex h-8 items-center gap-1 rounded-full px-1" style={{ backgroundColor: bg }}>
      <button disabled={busy} onClick={() => onDelta?.(-1)} className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-primary disabled:opacity-40"><Minus size={12} className="text-fg-secondary" /></button>
      <input
        value={text}
        disabled={busy}
        onChange={(e) => setText(e.target.value.replace(/[^0-9]/g, ""))}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
        className="w-9 bg-transparent text-center font-data text-xs font-bold text-fg-primary outline-none"
      />
      <button disabled={busy} onClick={() => onDelta?.(1)} className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-primary disabled:opacity-40"><Plus size={12} className="text-fg-secondary" /></button>
    </span>
  );
}

function StatusPill({ status }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-[5px]" style={{ backgroundColor: status.bg }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: status.color }} />
      <span className="font-body text-[11px] font-semibold" style={{ color: status.color }}>{status.label}</span>
    </span>
  );
}

function ProductRow({ p, trends, onChanged, onDeleted }) {
  const [qty, setQty] = useState(p.quantity);
  const [status, setStatus] = useState(p.stock_status);
  const [busy, setBusy] = useState(false);
  // (13) 인라인 수정
  const [editing, setEditing] = useState(false);
  const [cur, setCur] = useState({ name: p.name, price: p.price, trend_id: p.trend_id });
  const [draft, setDraft] = useState(cur);
  const [saving, setSaving] = useState(false);

  const applyQty = async (body) => {
    setBusy(true);
    try {
      const res = await api.patch(`/products/${p.product_id}/quantity`, body);
      setQty(res.quantity);
      setStatus(res.stock_status);
      onChanged?.(p.product_id);
    } catch (e) {
      alert(`수량 변경 실패: ${e.message}`);
    } finally {
      setBusy(false);
    }
  };
  const changeQty = (delta) => applyQty({ delta });
  const setQtyAbs = (quantity) => applyQty({ quantity });

  const remove = async () => {
    if (!confirm(`'${cur.name}' 메뉴를 삭제할까요?`)) return;
    try {
      await api.del(`/products/${p.product_id}`);
      onDeleted?.(p.product_id);
    } catch (e) {
      alert(`삭제 실패: ${e.message}`);
    }
  };

  const startEdit = () => { setDraft(cur); setEditing(true); };

  const save = async () => {
    if (!draft.name.trim()) return alert("메뉴명을 입력하세요.");
    setSaving(true);
    try {
      // (13) 상품 수정 — 이름/가격/트렌드
      const updated = await api.patch(`/products/${p.product_id}`, {
        name: draft.name.trim(),
        price: draft.price === "" || draft.price == null ? null : Number(draft.price),
        trend_id: draft.trend_id ? Number(draft.trend_id) : undefined,
      });
      setCur({
        name: updated?.name ?? draft.name.trim(),
        price: updated?.price ?? (draft.price === "" ? null : Number(draft.price)),
        trend_id: updated?.trend_id ?? (draft.trend_id ? Number(draft.trend_id) : null),
      });
      setEditing(false);
      onChanged?.(p.product_id);
    } catch (e) {
      alert(`상품 수정 실패: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const editInput = "h-8 rounded-lg border border-border-soft bg-surface-primary px-2 font-body text-[13px] text-fg-primary outline-none";

  return (
    <div className="flex items-center bg-surface-primary px-5 py-3.5">
      <div className="flex w-[220px] items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-surface-secondary">
          {p.image_url && <img src={p.image_url} alt="" className="h-full w-full object-cover" />}
        </span>
        {editing ? (
          <input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} className={editInput + " w-[150px] font-bold"} />
        ) : (
          <span className="font-body text-[13px] font-bold text-fg-primary">{cur.name}</span>
        )}
      </div>
      {editing ? (
        <input value={draft.price ?? ""} onChange={(e) => setDraft((d) => ({ ...d, price: e.target.value.replace(/[^0-9]/g, "") }))} placeholder="가격" className={editInput + " w-20 font-data"} />
      ) : (
        <span className="w-20 font-data text-[13px] font-semibold text-fg-primary">{won(cur.price)}</span>
      )}
      <div className="w-[140px]">
        {editing ? (
          <select value={draft.trend_id ?? ""} onChange={(e) => setDraft((d) => ({ ...d, trend_id: e.target.value }))} className={editInput}>
            <option value="">트렌드</option>
            {trends.map((t) => <option key={t.trend_id} value={t.trend_id}>{t.name}</option>)}
          </select>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 font-body text-[11px] font-semibold text-accent">
            {trends.find((t) => t.trend_id === cur.trend_id)?.name ?? "트렌드"}
          </span>
        )}
      </div>
      <div className="w-[150px]"><QtyBox qty={qty} onDelta={changeQty} onSet={setQtyAbs} busy={busy} /></div>
      <div className="w-[110px]"><StatusPill status={PILL_BY_STATUS[status] ?? OUT} /></div>
      <div className="flex flex-1 justify-end gap-1.5">
        {editing ? (
          <>
            <button onClick={save} disabled={saving} className="flex h-8 items-center justify-center rounded-full bg-accent px-3 font-body text-[11px] font-bold text-fg-inverse disabled:opacity-50">{saving ? "저장 중…" : "저장"}</button>
            <button onClick={() => setEditing(false)} className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-secondary"><X size={14} className="text-fg-muted" /></button>
          </>
        ) : (
          <>
            <button onClick={startEdit} className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-secondary"><Pencil size={13} className="text-fg-muted" /></button>
            <button onClick={remove} className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-secondary"><Trash2 size={14} className="text-fg-muted" /></button>
          </>
        )}
      </div>
    </div>
  );
}

function AddProductRow({ storeId, trends, onCreated }) {
  const fileRef = useRef(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [qty, setQty] = useState(0);
  const [trendId, setTrendId] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const pickImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { image_url } = await api.upload("/uploads/product-image", file);
      setImageUrl(image_url);
    } catch (err) {
      alert(`이미지 업로드 실패: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    if (!storeId) return alert("매장 정보를 아직 불러오지 못했습니다.");
    if (!name.trim()) return alert("메뉴명을 입력하세요.");
    if (!trendId) return alert("트렌드를 선택하세요.");
    setSaving(true);
    try {
      const product = await api.post(`/stores/${storeId}/products`, {
        trend_id: Number(trendId),
        name: name.trim(),
        price: price ? Number(price) : null,
        quantity: Number(qty) || 0,
        image_url: imageUrl,
      });
      onCreated?.(product);
      setName(""); setPrice(""); setQty(0); setTrendId(""); setImageUrl(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      alert(`메뉴 등록 실패: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center rounded-lg border border-accent bg-accent-soft px-5 py-3.5">
      <div className="flex w-[220px] items-center gap-2.5">
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={pickImage}
          className="hidden"
        />
        <button
          onClick={() => fileRef.current?.click()}
          title="메뉴 사진 업로드"
          className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg border border-accent bg-surface-primary"
        >
          {imageUrl ? (
            <img src={imageUrl} alt="" className="h-full w-full object-cover" />
          ) : uploading ? (
            <span className="font-data text-[9px] text-accent">…</span>
          ) : (
            <ImagePlus size={14} className="text-accent" />
          )}
        </button>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="메뉴명 입력"
          className="w-[150px] bg-transparent font-body text-[13px] font-bold text-fg-primary outline-none placeholder:font-normal placeholder:text-accent"
        />
      </div>
      <input
        value={price}
        onChange={(e) => setPrice(e.target.value.replace(/[^0-9]/g, ""))}
        placeholder="가격"
        className="w-20 bg-transparent font-data text-[13px] text-fg-primary outline-none placeholder:text-fg-muted"
      />
      <div className="w-[140px]">
        <select
          value={trendId}
          onChange={(e) => setTrendId(e.target.value)}
          className="rounded-full border border-border-soft bg-surface-primary px-2.5 py-1 font-body text-[11px] text-fg-primary outline-none"
        >
          <option value="">트렌드 선택</option>
          {trends.map((t) => (
            <option key={t.trend_id} value={t.trend_id}>{t.name}</option>
          ))}
        </select>
      </div>
      <div className="w-[150px]">
        <span className="inline-flex h-8 items-center gap-1 rounded-full bg-surface-primary px-1">
          <button onClick={() => setQty((q) => Math.max(0, q - 1))} className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-secondary"><Minus size={12} className="text-fg-secondary" /></button>
          <span className="w-7 text-center font-data text-xs font-bold text-fg-primary">{qty}</span>
          <button onClick={() => setQty((q) => q + 1)} className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-secondary"><Plus size={12} className="text-fg-secondary" /></button>
        </span>
      </div>
      <div className="w-[110px]">
        <span className="inline-flex items-center rounded-full border border-border-soft bg-surface-primary px-3 py-[5px] font-body text-[11px] text-fg-muted">자동</span>
      </div>
      <div className="flex flex-1 justify-end">
        <button
          onClick={submit}
          disabled={saving || uploading}
          className="flex h-8 items-center justify-center rounded-full bg-accent px-3.5 font-body text-[11px] font-bold text-fg-inverse disabled:opacity-50"
        >
          {saving ? "등록 중…" : "추가"}
        </button>
      </div>
    </div>
  );
}

function InventoryCard({ storeId, trends }) {
  const [products, setProducts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [q, setQ] = useState("");

  const loadLogs = useCallback(async (items) => {
    // 매장 전 상품의 inventory-logs 를 모아 최신순 상위 몇 건만.
    const all = await Promise.all(
      items.map((p) =>
        api.get(`/products/${p.product_id}/inventory-logs?limit=5`)
          .then((rows) => (rows || []).map((l) => ({ ...l, name: p.name })))
          .catch(() => [])
      )
    );
    const merged = all.flat().sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1)).slice(0, 5);
    setLogs(merged);
  }, []);

  const load = useCallback(async () => {
    if (!storeId) return;
    const path = `/stores/${storeId}/products${q ? `?q=${encodeURIComponent(q)}` : ""}`;
    const items = await api.get(path).catch(() => []);
    setProducts(items || []);
    loadLogs(items || []);
  }, [storeId, q, loadLogs]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="flex flex-col gap-[18px] rounded-2xl bg-surface-primary p-7">
      <div className="flex w-full items-center justify-between">
        <div className="flex flex-col gap-1">
          <h3 className="font-heading text-xl font-bold text-fg-primary">📦 상품 &amp; 재고 관리</h3>
          <p className="font-body text-xs text-fg-secondary">수량과 상태를 변경하면 사용자 지도에 즉시 반영됩니다</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-[200px] items-center gap-1.5 rounded-full bg-surface-secondary px-3.5">
            <Search size={14} className="text-fg-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="메뉴 검색"
              className="w-full bg-transparent font-body text-xs text-fg-primary outline-none placeholder:text-fg-muted"
            />
          </span>
        </div>
      </div>

      <div className="flex flex-col rounded-xl bg-surface-secondary">
        <div className="flex items-center px-5 py-3.5 font-body text-[11px] font-bold text-fg-muted">
          <span className="w-[220px]">상품</span>
          <span className="w-20">가격</span>
          <span className="w-[140px]">트렌드 연결</span>
          <span className="w-[150px]">수량 조절</span>
          <span className="w-[110px]">상태</span>
          <span className="flex-1 text-right">삭제</span>
        </div>
        {products.length === 0 && (
          <div className="px-5 py-6 text-center font-body text-xs text-fg-muted">등록된 메뉴가 없습니다. 아래에서 추가하세요.</div>
        )}
        {products.map((p) => (
          <ProductRow
            key={p.product_id}
            p={p}
            trends={trends}
            onChanged={() => loadLogs(products)}
            onDeleted={(id) => setProducts((arr) => arr.filter((x) => x.product_id !== id))}
          />
        ))}
        <AddProductRow
          storeId={storeId}
          trends={trends}
          onCreated={(p) => setProducts((a) => [...a, p])}
        />
      </div>

      <div className="flex flex-col gap-3 rounded-xl bg-surface-secondary p-[18px]">
        <span className="font-body text-[13px] font-bold text-fg-primary">⏱ 최근 재고 변경 이력</span>
        {logs.length === 0 && <span className="font-body text-[11px] text-fg-muted">변경 이력이 없습니다.</span>}
        {logs.map((h) => {
          const diff = (h.new_quantity ?? 0) - (h.old_quantity ?? 0);
          const color = h.new_quantity === 0 ? "#888888" : diff < 0 ? "#FF3D3D" : "#22A06B";
          const tag = h.new_quantity === 0 ? "품절" : `${diff > 0 ? "+" : ""}${diff}개`;
          return (
            <div key={h.log_id} className="flex w-full items-center justify-between rounded-lg bg-surface-primary px-3.5 py-2.5">
              <div className="flex items-center gap-2">
                <span className="font-data text-[11px] text-fg-muted">{timeAgo(h.updated_at)}</span>
                <span className="font-body text-xs font-semibold text-fg-primary">{h.name}</span>
                <span className="font-data text-[11px] text-fg-secondary">{h.old_quantity} → {h.new_quantity}</span>
              </div>
              <span className="font-data text-[11px] font-bold" style={{ color }}>{tag}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Notice ---------- */
function NoticeCard({ storeId }) {
  const [notices, setNotices] = useState([]);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  // (19) 인라인 수정
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const load = useCallback(async () => {
    if (!storeId) return;
    const rows = await api.get(`/stores/${storeId}/notices?status=PUBLISHED`).catch(() => []);
    setNotices(rows || []);
  }, [storeId]);

  useEffect(() => { load(); }, [load]);

  const publish = async () => {
    if (!storeId) return alert("매장 정보를 아직 불러오지 못했습니다.");
    if (!draft.trim()) return alert("공지 내용을 입력하세요.");
    setSaving(true);
    try {
      await api.post(`/stores/${storeId}/notices`, { content: draft.trim(), status: "PUBLISHED" });
      setDraft("");
      load();
    } catch (e) {
      alert(`게시 실패: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!confirm("이 공지를 삭제할까요?")) return;
    try {
      await api.del(`/notices/${id}`);
      setNotices((arr) => arr.filter((n) => n.notice_id !== id));
    } catch (e) {
      alert(`삭제 실패: ${e.message}`);
    }
  };

  const startEdit = (n) => { setEditingId(n.notice_id); setEditText(n.content ?? ""); };

  const saveEdit = async (id) => {
    if (!editText.trim()) return alert("공지 내용을 입력하세요.");
    setEditSaving(true);
    try {
      // (19) 공지 수정
      await api.patch(`/notices/${id}`, { content: editText.trim() });
      setNotices((arr) => arr.map((n) => (n.notice_id === id ? { ...n, content: editText.trim() } : n)));
      setEditingId(null);
    } catch (e) {
      alert(`공지 수정 실패: ${e.message}`);
    } finally {
      setEditSaving(false);
    }
  };

  const dday = (iso) => {
    if (!iso) return null;
    const d = Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
    return d >= 0 ? `만료 D-${d}` : "만료됨";
  };

  return (
    <div className="flex flex-col gap-[18px] rounded-2xl bg-surface-primary p-7">
      <div className="flex w-full items-center justify-between">
        <div className="flex flex-col gap-1">
          <h3 className="font-heading text-xl font-bold text-fg-primary">📢 공지 관리</h3>
          <p className="font-body text-xs text-fg-secondary">공지는 매장 상세 화면 상단에 띄워져 손님이 가장 먼저 확인합니다</p>
        </div>
        <span className="flex h-9 items-center rounded-full bg-surface-secondary px-3.5 font-body text-xs font-semibold text-fg-primary">게시 중 {notices.length}건</span>
      </div>

      <div className="flex flex-col gap-3 rounded-xl bg-surface-secondary p-[18px]">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-accent px-2.5 py-[3px] font-body text-[10px] font-bold text-fg-inverse">NEW</span>
          <span className="font-body text-[13px] font-bold text-fg-primary">빠른 공지 작성</span>
        </div>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="예) 우베 케이크 25개 입고 완료! 평일 17시 이후엔 소량 또는 품절될 수 있어요."
          className="flex h-[120px] w-full resize-none rounded-lg border border-border-soft bg-surface-primary px-4 py-3.5 font-body text-[13px] leading-[1.6] text-fg-primary outline-none placeholder:text-fg-muted"
        />
        <div className="flex w-full items-center justify-end">
          <button
            onClick={publish}
            disabled={saving}
            className="flex h-[34px] items-center rounded-full bg-accent px-4 font-body text-xs font-bold text-fg-inverse disabled:opacity-50"
          >
            {saving ? "게시 중…" : "게시하기"}
          </button>
        </div>
      </div>

      <div className="flex w-full items-center justify-between">
        <span className="font-body text-[13px] font-bold text-fg-primary">게시 중인 공지</span>
        <span className="font-body text-[11px] font-semibold text-fg-muted">최신순</span>
      </div>
      {notices.length === 0 && <span className="font-body text-[11px] text-fg-muted">게시 중인 공지가 없습니다.</span>}
      {notices.map((n) => (
        <div key={n.notice_id} className="flex flex-col gap-2 rounded-xl bg-surface-warm p-[18px]">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-accent px-2.5 py-[3px] font-body text-[10px] font-bold text-fg-inverse">게시중</span>
            </div>
            {editingId === n.notice_id ? (
              <div className="flex items-center gap-2">
                <button onClick={() => saveEdit(n.notice_id)} disabled={editSaving} className="font-body text-[11px] font-bold text-accent disabled:opacity-50">{editSaving ? "저장 중…" : "저장"}</button>
                <button onClick={() => setEditingId(null)} className="font-body text-[11px] font-semibold text-fg-muted">취소</button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={() => startEdit(n)} className="font-body text-[11px] font-semibold text-fg-secondary">수정</button>
                <button onClick={() => remove(n.notice_id)} className="font-body text-[11px] font-semibold text-accent">삭제</button>
              </div>
            )}
          </div>
          {editingId === n.notice_id ? (
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="h-[80px] w-full resize-none rounded-lg border border-border-soft bg-surface-primary px-3 py-2 font-body text-xs leading-[1.6] text-fg-primary outline-none"
            />
          ) : (
            <p className="font-body text-xs leading-[1.6] text-fg-secondary">{n.content}</p>
          )}
          {dday(n.expires_at) && <span className="font-body text-[11px] text-fg-muted">{dday(n.expires_at)}</span>}
        </div>
      ))}
    </div>
  );
}

/* ---------- Right column ---------- */
const RANGE_OPTIONS = [
  { value: "1d", label: "오늘" },
  { value: "7d", label: "최근 7일" },
  { value: "30d", label: "최근 30일" },
];
const rangeLabel = (r) => RANGE_OPTIONS.find((o) => o.value === r)?.label ?? r;

function RangeSelect({ range, onRange }) {
  return (
    <span className="flex h-8 items-center gap-1.5 rounded-full bg-surface-secondary px-3">
      <Calendar size={12} className="text-fg-primary" />
      <select
        value={range}
        onChange={(e) => onRange(e.target.value)}
        className="bg-transparent font-body text-xs font-semibold text-fg-primary outline-none"
      >
        {RANGE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </span>
  );
}

function ChartCard({ series, range, onRange }) {
  const buckets = series?.buckets || [];
  const max = Math.max(1, ...buckets.map((b) => b.views));
  const peakHour = series?.peak?.from;
  return (
    <div className="flex flex-col gap-[18px] rounded-2xl bg-surface-primary p-6">
      <div className="flex w-full items-center justify-between">
        <div className="flex flex-col gap-1">
          <h3 className="font-heading text-base font-bold text-fg-primary">시간대별 매장 조회</h3>
          <p className="font-body text-[11px] text-fg-muted">
            {`${rangeLabel(range)} ${won(series?.total ?? 0)}회`}
            {series?.peak ? ` · 피크 ${series.peak.from} ~ ${series.peak.to}` : ""}
          </p>
        </div>
        <RangeSelect range={range} onRange={onRange} />
      </div>
      <div className="flex h-[180px] w-full items-end gap-1.5">
        {buckets.length === 0 && <span className="m-auto font-body text-xs text-fg-muted">조회 데이터가 없습니다.</span>}
        {buckets.map((b) => (
          <div key={b.hour} className="flex flex-1 flex-col items-center justify-end gap-1">
            <div
              className="w-full rounded-t-lg rounded-b"
              style={{ height: Math.max(4, (b.views / max) * 160), backgroundColor: b.hour === peakHour?.slice(0, 2) ? "#7C3AED" : "#E8EAEE" }}
            />
            <span className="font-data text-[9px] text-fg-muted">{b.hour}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TopProdCard({ items, range, onRange }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-surface-primary p-6">
      <div className="flex w-full items-center justify-between">
        <h3 className="font-heading text-base font-bold text-fg-primary">트렌드별 조회수</h3>
        <RangeSelect range={range} onRange={onRange} />
      </div>
      {(!items || items.length === 0) && <span className="font-body text-xs text-fg-muted">조회 데이터가 없습니다.</span>}
      {(items || []).map((p) => (
        <div key={p.trend_id} className="flex flex-col gap-2">
          <div className="flex w-full items-center justify-between">
            <span className="font-body text-[13px] font-semibold text-fg-primary">{p.name}</span>
            <span className="font-data text-[13px] font-bold text-fg-primary">{won(p.views)}</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-surface-secondary">
            <div className="h-1.5 rounded-full bg-accent" style={{ width: p.pct + "%" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

const EVENT_ICON = { VIEW_STORE: Eye, CLICK_MARKER: MousePointerClick, SEARCH_TREND: Search };

function EventCard({ events }) {
  return (
    <div className="flex flex-col gap-3.5 rounded-2xl bg-surface-primary p-6">
      <div className="flex w-full items-center justify-between">
        <h3 className="font-heading text-base font-bold text-fg-primary">📊 최근 이벤트 로그</h3>
        <span className="font-body text-[11px] font-semibold text-accent">전체</span>
      </div>
      {(!events || events.length === 0) && <span className="font-body text-xs text-fg-muted">이벤트가 없습니다.</span>}
      {(events || []).map((e) => {
        const Icon = EVENT_ICON[e.event_type] || Eye;
        return (
          <div key={e.event_type} className="flex w-full items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-secondary">
              <Icon size={14} className="text-fg-secondary" />
            </span>
            <div className="flex flex-1 flex-col gap-0.5">
              <span className="font-body text-xs font-semibold text-fg-primary">{e.event_type} · {e.count}회</span>
            </div>
            <span className="font-data text-[11px] text-fg-muted">{timeAgo(e.created_at)}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Store info editor (10) ---------- */
function StoreEditPanel({ store, storeId, onSaved, onClose }) {
  const [form, setForm] = useState({
    name: store?.name ?? "",
    address: store?.address ?? "",
    phone: store?.phone ?? "",
    naver_place_url: store?.naver_place_url ?? "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const field = "h-11 w-full rounded-xl border border-border-soft bg-surface-primary px-3.5 font-body text-[13px] text-fg-primary outline-none placeholder:text-fg-muted";

  const save = async () => {
    if (!storeId) return alert("매장 정보를 아직 불러오지 못했습니다.");
    if (!form.name.trim()) return alert("매장 이름을 입력하세요.");
    setSaving(true);
    try {
      // (10) 매장 정보 수정
      const updated = await api.patch(`/stores/${storeId}`, {
        name: form.name.trim(),
        address: form.address.trim() || undefined,
        phone: form.phone.trim() || null,
        naver_place_url: form.naver_place_url.trim() || null,
      });
      onSaved?.(updated ?? form);
      onClose?.();
    } catch (e) {
      alert(`매장 정보 수정 실패: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-3.5 rounded-2xl bg-surface-primary p-7">
      <div className="flex w-full items-center justify-between">
        <h3 className="font-heading text-base font-bold text-fg-primary">🏪 매장 정보 수정</h3>
        <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-secondary"><X size={14} className="text-fg-muted" /></button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="font-body text-[11px] font-semibold text-fg-muted">매장 이름</span>
          <input value={form.name} onChange={set("name")} className={field} placeholder="매장 이름" />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="font-body text-[11px] font-semibold text-fg-muted">연락처</span>
          <input value={form.phone} onChange={set("phone")} className={field} placeholder="02-1234-5678" />
        </label>
        <label className="col-span-2 flex flex-col gap-1.5">
          <span className="font-body text-[11px] font-semibold text-fg-muted">주소</span>
          <input value={form.address} onChange={set("address")} className={field} placeholder="서울특별시 마포구 ..." />
        </label>
        <label className="col-span-2 flex flex-col gap-1.5">
          <span className="font-body text-[11px] font-semibold text-fg-muted">네이버 플레이스 URL</span>
          <input value={form.naver_place_url} onChange={set("naver_place_url")} className={field} placeholder="https://naver.me/..." />
        </label>
      </div>
      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="flex h-10 items-center rounded-full bg-surface-secondary px-4 font-body text-[13px] font-bold text-fg-primary">취소</button>
        <button onClick={save} disabled={saving} className="flex h-10 items-center gap-1.5 rounded-full bg-accent px-4 font-body text-[13px] font-bold text-fg-inverse disabled:opacity-50">
          <Check size={14} className="text-fg-inverse" />
          {saving ? "저장 중…" : "저장"}
        </button>
      </div>
    </div>
  );
}

/* ---------- Account footer ---------- */
function AccountFooter({ onLogout, onDeleteStore, onWithdraw }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-surface-primary px-7 py-5">
      <div className="flex flex-col gap-1">
        <span className="font-body text-sm font-bold text-fg-primary">계정 관리</span>
        <span className="font-body text-xs text-fg-muted">
          로그아웃하거나, 더 이상 Foorendy를 사용하지 않으신다면 매장을 삭제하거나 계정을 탈퇴할 수 있어요.
        </span>
      </div>
      <div className="flex items-center gap-2.5">
        <button
          onClick={onLogout}
          className="flex h-10 items-center gap-1.5 rounded-full border border-border-soft bg-surface-primary px-4 font-body text-[13px] font-bold text-fg-primary"
        >
          <LogOut size={14} className="text-fg-secondary" />
          로그아웃
        </button>
        <button
          onClick={onDeleteStore}
          className="flex h-10 items-center gap-1.5 rounded-full border border-[#E5484D] bg-surface-primary px-4 font-body text-[13px] font-bold text-[#E5484D]"
        >
          <Trash2 size={14} className="text-[#E5484D]" />
          매장 삭제
        </button>
        <button
          onClick={onWithdraw}
          className="flex h-10 items-center gap-1.5 rounded-full border border-[#E5484D] bg-surface-primary px-4 font-body text-[13px] font-bold text-[#E5484D]"
        >
          <UserX size={14} className="text-[#E5484D]" />
          회원 탈퇴
        </button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [storeEditOpen, setStoreEditOpen] = useState(false);
  const [storeMenuOpen, setStoreMenuOpen] = useState(false); // (6) 매장 전환 드롭다운
  const [trends, setTrends] = useState([]);
  const [stores, setStores] = useState([]);   // (6) 내 매장 전체
  const [store, setStore] = useState(null);    // 현재 선택된 매장
  const [profile, setProfile] = useState(null);
  const [userName, setUserName] = useState(""); // (7) 인사말용 이름
  const [storeStats, setStoreStats] = useState({ menus: 0, notices: 0 }); // (11) 삭제 모달용
  const [range, setRange] = useState("7d");    // (10) 조회 기간
  const [summary, setSummary] = useState(null);
  const [series, setSeries] = useState(null);
  const [byTrend, setByTrend] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    api.get("/trends?limit=100").then((d) => setTrends(d || [])).catch(() => setTrends([]));
    api.get("/stores/me").then((s) => { setStores(s || []); setStore(s?.[0] ?? null); }).catch(() => { setStores([]); setStore(null); });
    api.get("/auth/me").then(setProfile).catch(() => setProfile(null)); // (2) 내 프로필
    // (7) 인사말 이름: Supabase 세션의 user_metadata 우선, 없으면 이메일 앞부분
    supabase.auth.getUser()
      .then(({ data }) => {
        const u = data?.user;
        const meta = u?.user_metadata || {};
        setUserName(meta.full_name || meta.name || (u?.email ? u.email.split("@")[0] : ""));
      })
      .catch(() => setUserName(""));
  }, []);

  // (3) 로그아웃 — Supabase 세션 종료 후 로그인 화면으로
  async function handleLogout() {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error("[로그아웃]", e.message);
    }
    navigate("/login");
  }

  const storeId = store?.store_id;

  useEffect(() => {
    if (!storeId) return;
    api.get(`/stores/${storeId}/analytics/summary`).then(setSummary).catch(() => setSummary(null));
    api.get(`/stores/${storeId}/analytics/events`).then((d) => setEvents(d || [])).catch(() => setEvents([]));
    // (11) 삭제 모달용 메뉴/공지 수
    api.get(`/stores/${storeId}/products`).then((d) => setStoreStats((st) => ({ ...st, menus: (d || []).length }))).catch(() => {});
    api.get(`/stores/${storeId}/notices?status=PUBLISHED`).then((d) => setStoreStats((st) => ({ ...st, notices: (d || []).length }))).catch(() => {});
  }, [storeId]);

  // (10) 조회 기간(range) 바뀌면 시계열만 다시 조회
  useEffect(() => {
    if (!storeId) return;
    api.get(`/stores/${storeId}/analytics/timeseries?metric=views&range=${range}`).then(setSeries).catch(() => setSeries(null));
    api.get(`/stores/${storeId}/analytics/timeseries?metric=by_trend&range=${range}`).then((d) => setByTrend(d || [])).catch(() => setByTrend([]));
  }, [storeId, range]);

  const kpis = buildKpis(summary);

  return (
    <div className="flex min-h-screen w-full justify-center bg-surface-secondary">
      <div className="w-full max-w-canvas bg-surface-secondary">
        <TopNav active="사장님 대시보드" />
        <main className="flex flex-col gap-5 px-10 pb-10 pt-6">
          {/* header */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2.5">
              <span className="font-body text-xs font-bold text-accent">사장님 대시보드</span>
              {/* (6) 매장 전환 드롭다운 — 같은 사장님의 다른 매장으로 전환 */}
              <div className="relative">
                <button
                  onClick={() => setStoreMenuOpen((v) => !v)}
                  className="flex h-7 items-center gap-1.5 rounded-full border border-border-soft bg-surface-primary px-3"
                >
                  <span className="font-body text-xs font-semibold text-fg-primary">{store?.name ?? "매장 불러오는 중…"}</span>
                  <ChevronDown size={12} className="text-fg-muted" />
                </button>
                {storeMenuOpen && stores.length > 0 && (
                  <div className="absolute left-0 top-8 z-20 flex w-56 flex-col rounded-xl border border-border-soft bg-surface-primary py-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
                    {stores.map((s) => (
                      <button
                        key={s.store_id}
                        onClick={() => { setStore(s); setStoreMenuOpen(false); setStoreEditOpen(false); }}
                        className={"flex items-center justify-between px-3.5 py-2 text-left font-body text-xs hover:bg-surface-secondary " + (s.store_id === storeId ? "font-bold text-accent" : "font-medium text-fg-primary")}
                      >
                        <span className="truncate">{s.name}</span>
                        {s.store_id === storeId && <Check size={12} className="text-accent" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {profile?.email && (
                <span className="font-body text-xs text-fg-muted">{profile.email}</span>
              )}
              <button
                onClick={() => setStoreEditOpen((v) => !v)}
                className="flex h-7 items-center gap-1 rounded-full border border-border-soft bg-surface-primary px-2.5 font-body text-[11px] font-semibold text-fg-secondary"
              >
                <Pencil size={11} className="text-fg-muted" /> 정보 수정
              </button>
            </div>
            <h1 className="font-heading text-[32px] font-bold text-fg-primary">안녕하세요, {userName ? `${userName} ` : ""}사장님 👋</h1>
            <p className="font-body text-[13px] text-fg-secondary">
              오늘 {summary?.stock_changes_today ?? 0}건의 재고 변경과 {won(summary?.store_views_today ?? 0)}회 매장 조회가 있었어요.
            </p>
          </div>

          {/* (10) 매장 정보 수정 패널 */}
          {storeEditOpen && (
            <StoreEditPanel
              store={store}
              storeId={storeId}
              onSaved={(u) => setStore((s) => ({ ...s, ...u }))}
              onClose={() => setStoreEditOpen(false)}
            />
          )}

          {/* KPI row */}
          <div className="flex gap-5">
            {kpis.map((k) => <KpiCard key={k.title} {...k} />)}
          </div>

          {/* body */}
          <div className="flex gap-5">
            <div className="flex flex-1 flex-col gap-5">
              <InventoryCard storeId={storeId} trends={trends} />
              <NoticeCard storeId={storeId} />
            </div>
            <div className="flex w-[480px] flex-col gap-5">
              <ChartCard series={series} range={range} onRange={setRange} />
              <TopProdCard items={byTrend} range={range} onRange={setRange} />
              <EventCard events={events} />
            </div>
          </div>

          {/* account management */}
          <AccountFooter
            onLogout={handleLogout}
            onDeleteStore={() => setDeleteOpen(true)}
            onWithdraw={() => setWithdrawOpen(true)}
          />
        </main>
      </div>

      <DeleteStoreModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        store={store ? {
          name: store.name,
          emoji: "🟣",
          summary: `메뉴 ${storeStats.menus}개 · 공지 ${storeStats.notices}건${store.address ? ` · ${store.address.split(" ").slice(0, 2).join(" ")}` : ""}`,
        } : undefined}
        onConfirm={async () => {
          if (!storeId) return alert("불러온 매장이 없습니다.");
          try {
            await api.del(`/stores/${storeId}`);
            alert("매장이 삭제되었습니다.");
          } catch (e) {
            alert(`매장 삭제 실패: ${e.message}`);
          }
        }}
      />
      <WithdrawModal
        open={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        onConfirm={async () => {
          try {
            await api.del("/auth/me");
            alert("탈퇴가 완료되었습니다.");
          } catch (e) {
            alert(`회원 탈퇴 실패: ${e.message}`);
          }
        }}
      />
    </div>
  );
}
