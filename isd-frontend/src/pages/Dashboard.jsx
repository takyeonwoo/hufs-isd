import {
  ChevronDown, Eye, Search, Package, TrendingUp, ArrowUp, Flame, Plus, Minus,
  Trash2, Calendar, MousePointerClick,
} from "lucide-react";
import TopNav from "../components/TopNav.jsx";

/* ---------- KPI ---------- */
const kpis = [
  {
    title: "오늘 매장 조회수", icon: Eye, value: "1,248", sub: "어제 대비 +245",
    pill: { label: "+24%", color: "#22A06B", bg: "#E6F6EF", icon: ArrowUp },
  },
  {
    title: "인기 검색어 진입", icon: Search, value: "우베 #1", sub: "검색 → 우리 매장 노출 38%",
    pill: { label: "HOT", color: "#FF3D3D", bg: "#FFE5E5", icon: Flame },
  },
  {
    title: "오늘 재고 변경", icon: Package, value: "5", unit: "건", sub: "마지막 업데이트 10분 전",
  },
  {
    title: "트렌드 점수", icon: TrendingUp, value: "98.2", sub: "우베 #1 매장 · 상위 1%", dark: true,
    pill: { label: "+38%", color: "#5BE49F", bg: "#1F3D2F", icon: ArrowUp },
  },
];

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

/* ---------- Inventory ---------- */
const AVAIL = { label: "판매중", color: "#22A06B", bg: "#E6F6EF" };
const LOW = { label: "품절임박", color: "#F5A524", bg: "#FFF3D8" };
const OUT = { label: "품절", color: "#888888", bg: "#F7F8FA" };

const rows = [
  { name: "우베 케이크", thumb: "#F3D9FF", price: "6,800", trend: "🟣 우베", qty: 8, status: AVAIL },
  { name: "우베 라떼", thumb: "#F3D9FF", price: "5,500", trend: "🟣 우베", qty: 14, status: AVAIL },
  { name: "우베 크림빵", thumb: "#FFF3D8", price: "4,200", trend: "🟣 우베", qty: 3, status: LOW, qtyBg: "#FFF3D8" },
  { name: "우베 쿠키", thumb: "#F0F0F0", price: "2,800", trend: "🟣 우베", qty: 0, status: OUT },
];

function QtyBox({ qty, bg = "#F7F8FA" }) {
  return (
    <span className="inline-flex h-8 items-center gap-1 rounded-full px-1" style={{ backgroundColor: bg }}>
      <button className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-primary"><Minus size={12} className="text-fg-secondary" /></button>
      <span className="w-7 text-center font-data text-xs font-bold text-fg-primary">{qty}</span>
      <button className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-primary"><Plus size={12} className="text-fg-secondary" /></button>
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

function InventoryCard() {
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
            <span className="font-body text-xs text-fg-muted">메뉴 검색</span>
          </span>
          <button className="flex h-9 items-center gap-1.5 rounded-full bg-accent px-3.5">
            <Plus size={12} className="text-fg-inverse" />
            <span className="font-body text-xs font-bold text-fg-inverse">메뉴 등록</span>
          </button>
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
        {rows.map((r) => (
          <div key={r.name} className="flex items-center bg-surface-primary px-5 py-3.5">
            <div className="flex w-[220px] items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: r.thumb }} />
              <span className="font-body text-[13px] font-bold text-fg-primary">{r.name}</span>
            </div>
            <span className="w-20 font-data text-[13px] font-semibold text-fg-primary">{r.price}</span>
            <div className="w-[140px]">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 font-body text-[11px] font-semibold text-accent">{r.trend}</span>
            </div>
            <div className="w-[150px]"><QtyBox qty={r.qty} bg={r.qtyBg} /></div>
            <div className="w-[110px]"><StatusPill status={r.status} /></div>
            <div className="flex flex-1 justify-end">
              <button className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-secondary"><Trash2 size={14} className="text-fg-muted" /></button>
            </div>
          </div>
        ))}
        <div className="flex items-center rounded-lg border border-accent bg-accent-soft px-5 py-3.5">
          <div className="flex w-[220px] items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent bg-surface-primary"><Plus size={14} className="text-accent" /></span>
            <span className="font-body text-[13px] font-bold text-accent">메뉴명 입력</span>
          </div>
          <span className="w-20 font-data text-[13px] text-fg-muted">가격</span>
          <div className="w-[140px]">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border-soft bg-surface-primary px-2.5 py-1 font-body text-[11px] text-fg-muted">트렌드 선택</span>
          </div>
          <div className="w-[150px]"><QtyBox qty={0} /></div>
          <div className="w-[110px]">
            <span className="inline-flex items-center rounded-full border border-border-soft bg-surface-primary px-3 py-[5px] font-body text-[11px] text-fg-muted">상태</span>
          </div>
          <div className="flex flex-1 justify-end">
            <button className="flex h-8 items-center justify-center rounded-full bg-accent px-3.5 font-body text-[11px] font-bold text-fg-inverse">추가</button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl bg-surface-secondary p-[18px]">
        <span className="font-body text-[13px] font-bold text-fg-primary">⏱ 최근 재고 변경 이력</span>
        {[
          { t: "10:32", n: "우베 케이크", c: "12 → 8", tag: "−4개", color: "#FF3D3D" },
          { t: "10:14", n: "우베 쿠키", c: "2 → 0 (품절 처리)", tag: "품절", color: "#888888" },
          { t: "09:48", n: "우베 크림빵", c: "0 → 5 (입고)", tag: "+5개", color: "#22A06B" },
        ].map((h) => (
          <div key={h.t} className="flex w-full items-center justify-between rounded-lg bg-surface-primary px-3.5 py-2.5">
            <div className="flex items-center gap-2">
              <span className="font-data text-[11px] text-fg-muted">{h.t}</span>
              <span className="font-body text-xs font-semibold text-fg-primary">{h.n}</span>
              <span className="font-data text-[11px] text-fg-secondary">{h.c}</span>
            </div>
            <span className="font-data text-[11px] font-bold" style={{ color: h.color }}>{h.tag}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Notice ---------- */
function NoticeCard() {
  return (
    <div className="flex flex-col gap-[18px] rounded-2xl bg-surface-primary p-7">
      <div className="flex w-full items-center justify-between">
        <div className="flex flex-col gap-1">
          <h3 className="font-heading text-xl font-bold text-fg-primary">📢 공지 관리</h3>
          <p className="font-body text-xs text-fg-secondary">공지는 매장 상세 화면 상단에 띄워져 손님이 가장 먼저 확인합니다</p>
        </div>
        <span className="flex h-9 items-center rounded-full bg-surface-secondary px-3.5 font-body text-xs font-semibold text-fg-primary">게시 중 1건</span>
      </div>

      <div className="flex flex-col gap-3 rounded-xl bg-surface-secondary p-[18px]">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-accent px-2.5 py-[3px] font-body text-[10px] font-bold text-fg-inverse">NEW</span>
          <span className="font-body text-[13px] font-bold text-fg-primary">빠른 공지 작성</span>
        </div>
        <div className="flex h-[120px] w-full rounded-lg border border-border-soft bg-surface-primary px-4 py-3.5">
          <p className="font-body text-[13px] leading-[1.6] text-fg-primary">
            우베 케이크 25개 입고 완료! 평일 17시 이후엔 소량 또는 품절될 수 있어요. 미리 방문해주세요 :)
          </p>
        </div>
        <div className="flex w-full items-center justify-between">
          <span className="font-body text-[11px] font-semibold text-accent">미리보기</span>
          <button className="flex h-[34px] items-center rounded-full bg-accent px-4 font-body text-xs font-bold text-fg-inverse">게시하기</button>
        </div>
      </div>

      <div className="flex w-full items-center justify-between">
        <span className="font-body text-[13px] font-bold text-fg-primary">게시 중인 공지</span>
        <span className="font-body text-[11px] font-semibold text-fg-muted">최신순</span>
      </div>
      <div className="flex flex-col gap-2 rounded-xl bg-surface-warm p-[18px]">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-accent px-2.5 py-[3px] font-body text-[10px] font-bold text-fg-inverse">게시중</span>
            <span className="font-body text-[13px] font-bold text-fg-primary">우베 케이크 입고 안내</span>
          </div>
          <span className="font-body text-[11px] font-semibold text-accent">수정 · 삭제</span>
        </div>
        <p className="font-body text-xs leading-[1.6] text-fg-secondary">
          매일 한정 수량으로 들어옵니다. 오늘 17시 이후엔 소량 또는 품절될 수 있어요. 미리 방문해주세요!
        </p>
        <span className="font-body text-[11px] text-fg-muted">만료 D-3</span>
      </div>
    </div>
  );
}

/* ---------- Right column ---------- */
const bars = [18, 28, 44, 40, 55, 80, 112, 138, 160, 148, 108, 72];
const accentBars = [8, 9];

function ChartCard() {
  return (
    <div className="flex flex-col gap-[18px] rounded-2xl bg-surface-primary p-6">
      <div className="flex w-full items-center justify-between">
        <div className="flex flex-col gap-1">
          <h3 className="font-heading text-base font-bold text-fg-primary">시간대별 매장 조회</h3>
          <p className="font-body text-[11px] text-fg-muted">오늘 1,248회 · 피크 14:00 ~ 16:00</p>
        </div>
        <span className="flex h-8 items-center gap-1.5 rounded-full bg-surface-secondary px-3">
          <Calendar size={12} className="text-fg-primary" />
          <span className="font-body text-xs font-semibold text-fg-primary">최근 7일</span>
          <ChevronDown size={12} className="text-fg-muted" />
        </span>
      </div>
      <div className="flex h-[180px] w-full items-end gap-1.5">
        {bars.map((h, i) => (
          <div key={i} className="flex flex-1 items-end">
            <div
              className="w-full rounded-t-lg rounded-b"
              style={{ height: h, backgroundColor: accentBars.includes(i) ? "#7C3AED" : "#E8EAEE" }}
            />
          </div>
        ))}
      </div>
      <div className="flex w-full items-center justify-between font-data text-[10px] text-fg-muted">
        {["08", "10", "12", "14", "16", "18", "20"].map((x) => <span key={x}>{x}</span>)}
      </div>
    </div>
  );
}

const topProds = [
  { emoji: "🟣", name: "우베", value: "1,420", pct: 100 },
  { emoji: "🍫", name: "두바이초콜릿", value: "980", pct: 69 },
  { emoji: "🍡", name: "두쫀쿠", value: "620", pct: 44 },
  { emoji: "🧈", name: "버터떡", value: "240", pct: 17 },
  { emoji: "🥐", name: "크루키", value: "95", pct: 7 },
];

function TopProdCard() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-surface-primary p-6">
      <div className="flex w-full items-center justify-between">
        <h3 className="font-heading text-base font-bold text-fg-primary">트렌드별 조회수</h3>
        <span className="flex h-8 items-center gap-1.5 rounded-full bg-surface-secondary px-3">
          <Calendar size={12} className="text-fg-primary" />
          <span className="font-body text-xs font-semibold text-fg-primary">최근 7일</span>
          <ChevronDown size={12} className="text-fg-muted" />
        </span>
      </div>
      {topProds.map((p) => (
        <div key={p.name} className="flex flex-col gap-2">
          <div className="flex w-full items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="text-sm leading-none">{p.emoji}</span>
              <span className="font-body text-[13px] font-semibold text-fg-primary">{p.name}</span>
            </span>
            <span className="font-data text-[13px] font-bold text-fg-primary">{p.value}</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-surface-secondary">
            <div className="h-1.5 rounded-full bg-accent" style={{ width: p.pct + "%" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

const events = [
  { icon: Eye, title: "VIEW_STORE · 신규 사용자 24명", desc: "우베 검색 → 매장 상세 진입", time: "방금" },
  { icon: MousePointerClick, title: "CLICK_MARKER · 마커 클릭 18회", desc: "홍대입구 반경 1km 사용자", time: "3분 전" },
  { icon: Search, title: "SEARCH_TREND · 우베 검색 진입", desc: "홈 → 우베 트렌드 카드 클릭", time: "12분 전" },
];

function EventCard() {
  return (
    <div className="flex flex-col gap-3.5 rounded-2xl bg-surface-primary p-6">
      <div className="flex w-full items-center justify-between">
        <h3 className="font-heading text-base font-bold text-fg-primary">📊 최근 이벤트 로그</h3>
        <span className="font-body text-[11px] font-semibold text-accent">전체</span>
      </div>
      {events.map((e) => (
        <div key={e.title} className="flex w-full items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-secondary">
            <e.icon size={14} className="text-fg-secondary" />
          </span>
          <div className="flex flex-1 flex-col gap-0.5">
            <span className="font-body text-xs font-semibold text-fg-primary">{e.title}</span>
            <span className="font-body text-[11px] text-fg-muted">{e.desc}</span>
          </div>
          <span className="font-data text-[11px] text-fg-muted">{e.time}</span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  return (
    <div className="flex min-h-screen w-full justify-center bg-surface-secondary">
      <div className="w-full max-w-canvas bg-surface-secondary">
        <TopNav active="사장님 대시보드" />
        <main className="flex flex-col gap-5 px-10 pb-10 pt-6">
          {/* header */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2.5">
              <span className="font-body text-xs font-bold text-accent">사장님 대시보드</span>
              <span className="flex h-7 items-center gap-1.5 rounded-full border border-border-soft bg-surface-primary px-3">
                <span className="font-body text-xs font-semibold text-fg-primary">연남 우베하우스</span>
                <ChevronDown size={12} className="text-fg-muted" />
              </span>
            </div>
            <h1 className="font-heading text-[32px] font-bold text-fg-primary">안녕하세요, 김사장님 👋</h1>
            <p className="font-body text-[13px] text-fg-secondary">오늘 5건의 재고 변경과 1,248회 매장 조회가 있었어요.</p>
          </div>

          {/* KPI row */}
          <div className="flex gap-5">
            {kpis.map((k) => <KpiCard key={k.title} {...k} />)}
          </div>

          {/* body */}
          <div className="flex gap-5">
            <div className="flex flex-1 flex-col gap-5">
              <InventoryCard />
              <NoticeCard />
            </div>
            <div className="flex w-[480px] flex-col gap-5">
              <ChartCard />
              <TopProdCard />
              <EventCard />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
