import { useEffect, useRef } from "react";
import { MapPin, ChevronDown, List, Map as MapIcon, Info, Plus, Minus, LocateFixed, Timer, X } from "lucide-react";
import TopNav from "../components/TopNav.jsx";
import StoreCard from "../components/StoreCard.jsx";
import { loadNaverMaps } from "../lib/naverMap.js";

const trendChips = ["두바이초콜릿", "두쫀쿠", "버터떡", "크루키", "바스크치즈", "말차푸딩", "밤티라미수", "약과쿠키", "흑임자라떼"];

const stockFilters = [
  { label: "판매중", color: "#22A06B", bg: "#E6F6EF" },
  { label: "품절임박", color: "#F5A524", bg: "#FFF3D8" },
  { label: "품절 제외", color: "#666666", bg: "#F7F8FA" },
];

const SOLD_OUT = { label: "품절", color: "#888888", bg: "#F0F0F0" };
const SOLD_LOW = { label: "품절임박", color: "#F5A524", bg: "#FFF3D8" };

const list = [
  { emoji: "🟣", name: "연남 우베하우스", desc: "우베 케이크 · 6,800원 · 잔여 8", distance: "0.4 km", time: "10분 전 업데이트" },
  { emoji: "🟣", name: "성수 우베 라떼바", desc: "우베 라떼 · 5,500원 · 잔여 14", distance: "0.9 km", time: "22분 전 업데이트" },
  { emoji: "🍰", name: "합정 디저트연구소", desc: "우베 카눌레 · 3,800원 · 잔여 0", distance: "1.1 km", time: "품절 · 5분 전", stock: SOLD_OUT },
  { emoji: "🥐", name: "망원 우베 베이커리", desc: "우베 크림빵 · 4,200원 · 잔여 3", distance: "1.3 km", time: "1분 전 업데이트", stock: SOLD_LOW },
  { emoji: "🍮", name: "이대 우베 푸딩샵", desc: "우베 푸딩 · 4,500원 · 잔여 11", distance: "1.5 km", time: "방금 업데이트" },
];

// 홍대입구역 일대 (시연용 좌표)
const MY_LOCATION = { lat: 37.5571, lng: 126.9245 };

const markers = [
  { lat: 37.5605, lng: 126.923, emoji: "🟣", label: "우베 6.8k", bg: "#7C3AED" },
  { lat: 37.5588, lng: 126.929, emoji: "🟣", label: "우베 5.5k", bg: "#7C3AED" },
  { lat: 37.5495, lng: 126.914, emoji: null, label: "품절", bg: "#9CA3AF" },
  { lat: 37.556, lng: 126.905, emoji: "🥐", label: "품절임박 4.2k", bg: "#F5A524" },
  { lat: 37.563, lng: 126.918, emoji: "🍮", label: "우베 4.5k", bg: "#7C3AED" },
  { lat: 37.552, lng: 126.927, emoji: "🟣", label: "우베 7.2k", bg: "#7C3AED" },
];

// 기존 마커 디자인을 그대로 HTML 문자열로 (네이버 마커 icon.content 용)
function markerHtml({ emoji, label, bg }) {
  return `
    <div style="display:flex;height:36px;align-items:center;gap:6px;border-radius:9999px;
      border:3px solid #fff;padding:0 12px;background:${bg};
      box-shadow:0 3px 8px rgba(0,0,0,0.2);white-space:nowrap;transform:translate(-50%,-50%);">
      ${emoji ? `<span style="font-size:14px;line-height:1;">${emoji}</span>` : ""}
      <span style="font-family:inherit;font-size:12px;font-weight:700;color:#fff;">${label}</span>
    </div>`;
}

function FilterBar() {
  return (
    <div className="flex h-[72px] w-full items-center justify-between gap-4 overflow-x-auto bg-surface-primary px-10 py-4">
      <div className="flex items-center gap-2">
        <span className="shrink-0 font-body text-xs font-semibold text-fg-muted">🔥 트렌드</span>
        <span className="flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-accent px-4">
          <span className="font-body text-[13px] font-bold text-fg-inverse">우베</span>
          <span className="font-data text-[11px] font-bold text-[#FFD9C2]">#1</span>
        </span>
        {trendChips.map((c) => (
          <span key={c} className="flex h-9 shrink-0 items-center rounded-full bg-surface-secondary px-4 font-body text-[13px] font-medium text-fg-secondary">
            {c}
          </span>
        ))}
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

function Sidebar() {
  return (
    <aside className="flex w-[440px] shrink-0 flex-col gap-[18px] overflow-y-auto bg-surface-primary p-6">
      <div className="flex flex-col gap-1.5">
        <div className="flex w-full items-center justify-between">
          <h2 className="font-heading text-[22px] font-bold text-fg-primary">우베 판매 매장</h2>
          <span className="flex items-center gap-1.5 rounded-full bg-surface-secondary px-2.5 py-1">
            <span className="font-data text-xs font-bold text-fg-primary">27</span>
            <span className="font-body text-[11px] text-fg-secondary">매장</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={12} className="text-accent" />
          <span className="font-body text-xs text-fg-secondary">홍대입구역 · 반경 1.5 km</span>
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
        {list.map((s) => (
          <StoreCard key={s.name} {...s} />
        ))}
      </div>
    </aside>
  );
}

function StorePopover() {
  return (
    <div className="absolute left-[540px] top-[60px] z-10 flex w-[436px] flex-col gap-3.5 rounded-2xl bg-surface-primary p-5 shadow-[0_8px_24px_rgba(0,0,0,0.16)]">
      <div className="flex w-full gap-3.5">
        <div className="flex h-[88px] w-[88px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-warm">
          <span className="text-[40px] leading-none">🟣</span>
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex w-full items-center justify-between">
            <span className="font-heading text-lg font-bold text-fg-primary">연남 우베하우스</span>
            <button className="flex h-6 w-6 items-center justify-center">
              <X size={16} className="text-fg-muted" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-accent-soft px-2.5 py-[3px] font-body text-[11px] font-bold text-accent">품절임박</span>
            <span className="font-body text-xs font-medium text-fg-secondary">· 8개 남음</span>
          </div>
          <div className="flex items-center gap-1">
            <Timer size={12} className="text-fg-muted" />
            <span className="font-body text-[11px] text-fg-muted">10분 전 업데이트</span>
          </div>
        </div>
      </div>
      <div className="rounded-xl bg-surface-secondary p-3.5">
        <p className="font-body text-xs leading-[1.6] text-fg-primary">
          “매일 11시 오픈! 우베 페이스트와 생크림을 듬뿍 넣은 시그니처 우베 케이크. 평일 14시 이후엔 빠르게 소진되니 미리 방문 추천드려요 :)”
        </p>
      </div>
      <button className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#03C75A]">
        <span className="font-heading text-sm font-bold text-fg-inverse">N</span>
        <span className="font-body text-[13px] font-bold text-fg-inverse">네이버 플레이스에서 보기</span>
      </button>
    </div>
  );
}

function MapArea() {
  const mapEl = useRef(null);
  const mapRef = useRef(null);

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

        // 내 위치
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

        // 매장 마커
        markers.forEach((m) => {
          new maps.Marker({
            position: new maps.LatLng(m.lat, m.lng),
            map,
            icon: { content: markerHtml(m) },
          });
        });
      })
      .catch((err) => {
        // 키 미설정 등 로드 실패 시 콘솔에만 표시 (UI는 빈 회색 배경 유지)
        console.error("[NaverMap]", err.message);
      });

    return () => {
      canceled = true;
      mapRef.current?.destroy?.();
      mapRef.current = null;
    };
  }, []);

  const zoomBy = (delta) => {
    const map = mapRef.current;
    if (map) map.setZoom(map.getZoom() + delta, true);
  };

  const recenter = () => {
    mapRef.current?.panTo(new window.naver.maps.LatLng(MY_LOCATION.lat, MY_LOCATION.lng));
  };

  return (
    <div className="relative flex-1 overflow-hidden bg-[#E8EDF0]">
      {/* 실제 네이버 지도 */}
      <div ref={mapEl} className="absolute inset-0 h-full w-full" />

      {/* top overlay */}
      <div className="pointer-events-none absolute left-6 top-6 z-10 flex items-center gap-2.5 rounded-full bg-surface-primary px-4 py-2.5 shadow-[0_2px_8px_rgba(0,0,0,0.09)]">
        <Info size={14} className="text-accent" />
        <span className="font-body text-xs font-medium text-fg-primary">
          우베 트렌드 활성 지역 · 마커를 클릭하면 매장 상세가 열립니다
        </span>
      </div>

      {/* locate + zoom */}
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

      <StorePopover />
    </div>
  );
}

export default function MapPage() {
  return (
    <div className="flex min-h-screen w-full justify-center bg-surface-secondary">
      <div className="flex w-full max-w-canvas flex-col bg-surface-secondary">
        <TopNav active="지도" />
        <FilterBar />
        <div className="flex h-[820px] w-full">
          <Sidebar />
          <MapArea />
        </div>
      </div>
    </div>
  );
}
