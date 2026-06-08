import { useEffect, useRef, useState, useCallback } from "react";
import { MapPin, ChevronDown, List, Map as MapIcon, Info, Plus, Minus, LocateFixed, Timer, X } from "lucide-react";
import TopNav from "../components/TopNav.jsx";
import StoreCard from "../components/StoreCard.jsx";
import { loadNaverMaps } from "../lib/naverMap.js";
import { api } from "../lib/api.js";
import { logEvent } from "../lib/analytics.js";

// 홍대입구역 일대 (시연용 기준 좌표)
const MY_LOCATION = { lat: 37.5571, lng: 126.9245 };
const RADIUS_KM = 3;

const STOCK_PILL = {
  AVAILABLE: { label: "판매중", color: "#22A06B", bg: "#E6F6EF" },
  LOW: { label: "품절임박", color: "#F5A524", bg: "#FFF3D8" },
  SOLD_OUT: { label: "품절", color: "#888888", bg: "#F0F0F0" },
};
const MARKER_BG = { AVAILABLE: "#7C3AED", LOW: "#F5A524", SOLD_OUT: "#9CA3AF" };

const stockFilters = [
  { label: "판매중", color: "#22A06B", bg: "#E6F6EF" },
  { label: "품절임박", color: "#F5A524", bg: "#FFF3D8" },
  { label: "품절 제외", color: "#666666", bg: "#F7F8FA" },
];

function timeAgo(iso) {
  if (!iso) return "";
  const sec = (Date.now() - new Date(iso).getTime()) / 1000;
  if (sec < 60) return "방금 업데이트";
  if (sec < 3600) return `${Math.floor(sec / 60)}분 전 업데이트`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}시간 전 업데이트`;
  return `${Math.floor(sec / 86400)}일 전 업데이트`;
}

function storeDesc(s) {
  const fp = s.featured_product;
  if (!fp) return "등록된 메뉴 없음";
  return `${fp.name} · ${Number(fp.price ?? 0).toLocaleString()}원 · 잔여 ${fp.quantity ?? 0}`;
}

// 기존 마커 디자인 그대로 HTML 문자열로 (네이버 마커 icon.content 용)
function markerHtml({ emoji, label, bg }) {
  return `
    <div style="display:flex;height:36px;align-items:center;gap:6px;border-radius:9999px;
      border:3px solid #fff;padding:0 12px;background:${bg};
      box-shadow:0 3px 8px rgba(0,0,0,0.2);white-space:nowrap;transform:translate(-50%,-50%);cursor:pointer;">
      ${emoji ? `<span style="font-size:14px;line-height:1;">${emoji}</span>` : ""}
      <span style="font-family:inherit;font-size:12px;font-weight:700;color:#fff;">${label}</span>
    </div>`;
}

function markerOf(s) {
  const fp = s.featured_product;
  const status = fp?.stock_status ?? "AVAILABLE";
  const label = status === "SOLD_OUT" ? "품절" : `${s.trend?.name ?? ""} ${((fp?.price ?? 0) / 1000).toFixed(1)}k`.trim();
  return { lat: s.latitude, lng: s.longitude, emoji: status === "SOLD_OUT" ? null : "🟣", label, bg: MARKER_BG[status] };
}

function FilterBar({ trends, activeId, onPick }) {
  const top = trends[0];
  return (
    <div className="flex h-[72px] w-full items-center justify-between gap-4 overflow-x-auto bg-surface-primary px-10 py-4">
      <div className="flex items-center gap-2">
        <span className="shrink-0 font-body text-xs font-semibold text-fg-muted">🔥 트렌드</span>
        {trends.map((t, i) => {
          const active = t.trend_id === activeId;
          return (
            <button
              key={t.trend_id}
              onClick={() => onPick(t.trend_id)}
              className={"flex h-9 shrink-0 items-center gap-1.5 rounded-full px-4 " + (active ? "bg-accent" : "bg-surface-secondary")}
            >
              <span className={"font-body text-[13px] font-bold " + (active ? "text-fg-inverse" : "text-fg-secondary font-medium")}>{t.name}</span>
              {t.rank && <span className={"font-data text-[11px] font-bold " + (active ? "text-[#FFD9C2]" : "text-fg-muted")}>#{t.rank}</span>}
            </button>
          );
        })}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="font-body text-xs font-semibold text-fg-muted">재고:</span>
        {stockFilters.map((s) => (
          <span key={s.label} className="flex h-9 items-center gap-1.5 rounded-full px-3" style={{ backgroundColor: s.bg }}>
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="font-body text-xs font-semibold" style={{ color: s.color }}>{s.label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function Sidebar({ stores, activeTrend, onSelect }) {
  return (
    <aside className="flex w-[440px] shrink-0 flex-col gap-[18px] overflow-y-auto bg-surface-primary p-6">
      <div className="flex flex-col gap-1.5">
        <div className="flex w-full items-center justify-between">
          <h2 className="font-heading text-[22px] font-bold text-fg-primary">{activeTrend?.name ?? "전체"} 판매 매장</h2>
          <span className="flex items-center gap-1.5 rounded-full bg-surface-secondary px-2.5 py-1">
            <span className="font-data text-xs font-bold text-fg-primary">{stores.length}</span>
            <span className="font-body text-[11px] text-fg-secondary">매장</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={12} className="text-accent" />
          <span className="font-body text-xs text-fg-secondary">홍대입구역 · 반경 {RADIUS_KM} km</span>
        </div>
      </div>
      <div className="flex w-full items-center justify-between">
        <span className="flex h-8 items-center gap-1.5 rounded-full bg-surface-secondary px-3">
          <span className="font-body text-xs font-semibold text-fg-primary">거리순</span>
          <ChevronDown size={12} className="text-fg-primary" />
        </span>
        <div className="flex h-8 items-center gap-1 rounded-full bg-surface-secondary p-[3px]">
          <span className="flex h-[26px] w-8 items-center justify-center rounded-full bg-surface-primary shadow-sm">
            <List size={14} className="text-fg-primary" />
          </span>
          <span className="flex h-[26px] w-8 items-center justify-center">
            <MapIcon size={14} className="text-fg-muted" />
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-2.5">
        {stores.length === 0 && <span className="font-body text-xs text-fg-muted">주변에 매장이 없습니다.</span>}
        {stores.map((s) => (
          <button key={s.store_id} onClick={() => onSelect(s.store_id)} className="text-left">
            <StoreCard
              name={s.name}
              desc={storeDesc(s)}
              distance={s.distance_km != null ? `${s.distance_km} km` : ""}
              time={timeAgo(s.featured_product?.stock_updated_at)}
              stock={STOCK_PILL[s.featured_product?.stock_status] ?? STOCK_PILL.AVAILABLE}
            />
          </button>
        ))}
      </div>
    </aside>
  );
}

function StorePopover({ detail, onClose }) {
  if (!detail) return null;
  const fp = detail.products?.[0];
  const status = fp?.stock_status ?? "AVAILABLE";
  const pill = STOCK_PILL[status];
  return (
    <div className="absolute left-[540px] top-[60px] z-10 flex w-[436px] flex-col gap-3.5 rounded-2xl bg-surface-primary p-5 shadow-[0_8px_24px_rgba(0,0,0,0.16)]">
      <div className="flex w-full gap-3.5">
        <div className="flex h-[88px] w-[88px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-warm">
          {fp?.image_url ? <img src={fp.image_url} alt="" className="h-full w-full object-cover" /> : <span className="text-[40px] leading-none">🟣</span>}
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex w-full items-center justify-between">
            <span className="font-heading text-lg font-bold text-fg-primary">{detail.name}</span>
            <button onClick={onClose} className="flex h-6 w-6 items-center justify-center">
              <X size={16} className="text-fg-muted" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full px-2.5 py-[3px] font-body text-[11px] font-bold" style={{ backgroundColor: pill.bg, color: pill.color }}>{pill.label}</span>
            {fp && <span className="font-body text-xs font-medium text-fg-secondary">· {fp.quantity}개 남음</span>}
          </div>
          <div className="flex items-center gap-1">
            <Timer size={12} className="text-fg-muted" />
            <span className="font-body text-[11px] text-fg-muted">{timeAgo(fp?.stock_updated_at) || "정보 없음"}</span>
          </div>
        </div>
      </div>
      {detail.active_notice && (
        <div className="rounded-xl bg-surface-secondary p-3.5">
          <p className="font-body text-xs leading-[1.6] text-fg-primary">“{detail.active_notice.content}”</p>
        </div>
      )}
      {detail.naver_place_url && (
        <a href={detail.naver_place_url} target="_blank" rel="noreferrer" className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#03C75A]">
          <span className="font-heading text-sm font-bold text-fg-inverse">N</span>
          <span className="font-body text-[13px] font-bold text-fg-inverse">네이버 플레이스에서 보기</span>
        </a>
      )}
    </div>
  );
}

function MapArea({ stores, detail, onSelect, onClose }) {
  const mapEl = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    let canceled = false;
    loadNaverMaps()
      .then((maps) => {
        if (canceled || !mapEl.current) return;
        const map = new maps.Map(mapEl.current, {
          center: new maps.LatLng(MY_LOCATION.lat, MY_LOCATION.lng),
          zoom: 15,
          mapDataControl: false,
          scaleControl: false,
          logoControl: true,
          zoomControl: false,
        });
        mapRef.current = map;
        new maps.Marker({
          position: new maps.LatLng(MY_LOCATION.lat, MY_LOCATION.lng),
          map,
          icon: {
            content: `<div style="display:flex;height:28px;width:28px;align-items:center;justify-content:center;
              border-radius:9999px;border:4px solid #fff;background:#1A73E8;transform:translate(-50%,-50%);
              box-shadow:0 2px 6px rgba(0,0,0,0.25);">
              <span style="height:10px;width:10px;border-radius:9999px;background:#fff;"></span></div>`,
          },
        });
      })
      .catch((err) => console.error("[NaverMap]", err.message));
    return () => {
      canceled = true;
      mapRef.current?.destroy?.();
      mapRef.current = null;
    };
  }, []);

  // 매장 데이터가 바뀌면 마커 다시 그리기
  useEffect(() => {
    const maps = window.naver?.maps;
    const map = mapRef.current;
    if (!maps || !map) return;
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    stores
      .filter((s) => s.latitude != null && s.longitude != null)
      .forEach((s) => {
        const marker = new maps.Marker({
          position: new maps.LatLng(s.latitude, s.longitude),
          map,
          icon: { content: markerHtml(markerOf(s)) },
        });
        maps.Event.addListener(marker, "click", () => {
          logEvent("CLICK_MARKER", { store_id: s.store_id }); // (28)
          onSelect(s.store_id);
        });
        markersRef.current.push(marker);
      });
  }, [stores, onSelect]);

  const zoomBy = (delta) => {
    const map = mapRef.current;
    if (map) map.setZoom(map.getZoom() + delta, true);
  };
  const recenter = () => mapRef.current?.panTo(new window.naver.maps.LatLng(MY_LOCATION.lat, MY_LOCATION.lng));

  return (
    <div className="relative flex-1 overflow-hidden bg-[#E8EDF0]">
      <div ref={mapEl} className="absolute inset-0 h-full w-full" />

      <div className="pointer-events-none absolute left-6 top-6 z-10 flex items-center gap-2.5 rounded-full bg-surface-primary px-4 py-2.5 shadow-[0_2px_8px_rgba(0,0,0,0.09)]">
        <Info size={14} className="text-accent" />
        <span className="font-body text-xs font-medium text-fg-primary">
          마커를 클릭하면 매장 상세가 열립니다
        </span>
      </div>

      <button
        onClick={recenter}
        className="absolute left-[920px] top-[660px] z-10 flex h-12 w-12 items-center justify-center rounded-full bg-surface-primary shadow-[0_2px_8px_rgba(0,0,0,0.09)]"
      >
        <LocateFixed size={20} className="text-accent" />
      </button>
      <div className="absolute left-[920px] top-[740px] z-10 flex h-24 w-12 flex-col items-center gap-1 rounded-full bg-surface-primary p-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.09)]">
        <button onClick={() => zoomBy(1)} className="flex h-9 w-9 items-center justify-center">
          <Plus size={18} className="text-fg-primary" />
        </button>
        <button onClick={() => zoomBy(-1)} className="flex h-9 w-9 items-center justify-center">
          <Minus size={18} className="text-fg-primary" />
        </button>
      </div>

      <StorePopover detail={detail} onClose={onClose} />
    </div>
  );
}

export default function MapPage() {
  const [trends, setTrends] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [stores, setStores] = useState([]);
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    api.get("/trends?limit=10")
      .then((d) => {
        setTrends(d || []);
        if (d?.length) setActiveId(d[0].trend_id);
      })
      .catch(() => setTrends([]));
  }, []);

  useEffect(() => {
    const trendQ = activeId ? `&trend_id=${activeId}` : "";
    api.get(`/stores?lat=${MY_LOCATION.lat}&lng=${MY_LOCATION.lng}&radius=${RADIUS_KM}${trendQ}`)
      .then((d) => setStores(d || []))
      .catch(() => setStores([]));
  }, [activeId]);

  const select = useCallback((id) => {
    logEvent("VIEW_STORE", { store_id: id }); // (28) 매장 상세 조회
    api.get(`/stores/${id}`).then(setDetail).catch(() => setDetail(null));
  }, []);

  // 트렌드 칩 선택 → 필터 변경 + 검색 이벤트
  const pickTrend = useCallback((trendId) => {
    logEvent("SEARCH_TREND", { trend_id: trendId }); // (28)
    setActiveId(trendId);
  }, []);

  const activeTrend = trends.find((t) => t.trend_id === activeId);

  return (
    <div className="flex min-h-screen w-full justify-center bg-surface-secondary">
      <div className="flex w-full max-w-canvas flex-col bg-surface-secondary">
        <TopNav active="지도" />
        <FilterBar trends={trends} activeId={activeId} onPick={pickTrend} />
        <div className="flex h-[820px] w-full">
          <Sidebar stores={stores} activeTrend={activeTrend} onSelect={select} />
          <MapArea stores={stores} detail={detail} onSelect={select} onClose={() => setDetail(null)} />
        </div>
      </div>
    </div>
  );
}
