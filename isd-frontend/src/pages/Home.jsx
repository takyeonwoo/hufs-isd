import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Flame, ArrowRight } from "lucide-react";
import TopNav from "../components/TopNav.jsx";
import TrendCard from "../components/TrendCard.jsx";
import StoreCard from "../components/StoreCard.jsx";
import PrimaryButton from "../components/PrimaryButton.jsx";
import { api } from "../lib/api.js";

const HOT = { label: "HOT", color: "#FF3D3D", bg: "#FFE5E5", icon: "flame" };
const RISING = { label: "RISING", color: "#F5A524", bg: "#FFF0DA", icon: "arrow-up-right" };
const FALLING = { label: "FALLING", color: "#888888", bg: "#EEEEEE", icon: "arrow-down" };
const HOT_BY_STATUS = { HOT, RISING, FALLING };
const up = (label) => ({ label, color: "#22A06B", bg: "#E6F6EF", icon: "arrow-up" });
const down = (label) => ({ label, color: "#888888", bg: "#F0F0F0", icon: "arrow-down" });
const NEW = { label: "NEW", color: "#7C3AED", bg: "#EDE9FE", icon: "sparkles" };
const FLAT = { label: "-", color: "#888888", bg: "#F0F0F0", icon: "arrow-down" };

const STATUS_KO = { HOT: "급상승 인기", RISING: "상승세", FALLING: "하락세" };
const EMOJI = {
  "우베": "🟣", "애플망고": "🥭", "두바이쫀득쿠키": "🍫", "두바이초콜릿": "🍫", "버터떡": "🧈",
  "초코바게트": "🥖", "말빵": "🍞", "황치즈": "🧀", "말차": "🍵", "크루키": "🥐", "약과쿠키": "🍪",
};
const emojiOf = (name) => EMOJI[name] || "🍪";

const STOCK_PILL = {
  AVAILABLE: { label: "판매중", color: "#22A06B", bg: "#E6F6EF" },
  LOW: { label: "소량", color: "#F5A524", bg: "#FFF3D8" },
  SOLD_OUT: { label: "품절", color: "#888888", bg: "#F0F0F0" },
};

const MY_LOCATION = { lat: 37.5571, lng: 126.9245 };

function timeAgo(iso) {
  if (!iso) return "";
  const sec = (Date.now() - new Date(iso).getTime()) / 1000;
  if (sec < 60) return "방금 업데이트";
  if (sec < 3600) return `${Math.floor(sec / 60)}분 전 업데이트`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}시간 전 업데이트`;
  return `${Math.floor(sec / 86400)}일 전 업데이트`;
}

function rankDelta(t) {
  if (t.previous_rank == null) return NEW;
  const d = t.previous_rank - t.rank; // 양수 = 순위 상승
  if (d > 0) return up(String(d));
  if (d < 0) return down(String(-d));
  return FLAT;
}

function Hero({ searchRank }) {
  return (
    <section className="flex gap-8 rounded-2xl bg-surface-inverse p-12">
      <div className="flex flex-1 flex-col gap-6">
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#1F1F1F] px-3.5 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          <span className="font-body text-[11px] font-semibold text-fg-inverse">
            LIVE TREND · 매시간 랭킹 갱신
          </span>
        </span>
        <h1 className="whitespace-pre-line font-heading text-5xl font-bold leading-[1.15] text-fg-inverse">
          {"오늘 SNS 에서 가장 뜨고 있는\n트렌디 푸드 TOP 10"}
        </h1>
        <p className="whitespace-pre-line font-body text-[15px] leading-[1.5] text-[#B0B0B0]">
          {"우베, 두바이초콜릿, 두쫀쿠… 지금 뜨는 음식을 내 주변에서 바로 찾아보세요.\nFoorendy 가 SNS 언급량·재게시·증가율을 분석해 매시간 랭킹을 갱신합니다."}
        </p>
        <div className="flex gap-2.5">
          <Link to="/map">
            <PrimaryButton>트렌드 지도 열기</PrimaryButton>
          </Link>
          <Link
            to="/login"
            className="inline-flex h-11 items-center justify-center rounded-full bg-[#1F1F1F] px-[22px] font-body text-sm font-semibold text-fg-inverse"
          >
            사장님 등록하기
          </Link>
        </div>
      </div>
      <div className="flex h-[244px] w-[380px] flex-col justify-between gap-3.5 rounded-2xl bg-[#1F1F1F] p-6">
        <div className="flex w-full items-center justify-between">
          <span className="font-body text-xs font-semibold text-[#B0B0B0]">실시간 인기 검색어</span>
          <span className="font-data text-[11px] text-fg-muted">↻ 실시간</span>
        </div>
        <div className="flex flex-col gap-2">
          {searchRank.length === 0 && <span className="font-body text-xs text-fg-muted">집계 중…</span>}
          {searchRank.map((r) => (
            <div key={r.n} className="flex w-full items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className={"font-data text-sm font-bold " + (r.n === 1 ? "text-accent" : "text-[#B0B0B0]")}>{r.n}</span>
                <span className="font-body text-sm font-semibold text-fg-inverse">{r.name}</span>
              </div>
              <span className={"font-data text-xs font-bold " + (r.up ? "text-status-available" : "text-[#B0B0B0]")}>{r.delta}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const cols = [
    { title: "서비스", items: ["트렌드 랭킹", "내 주변 매장 지도", "매장 상세", "사장님 대시보드"] },
    { title: "팀 Foorendy", items: ["프로젝트 소개", "ISD 팀 페이지", "GitHub", "문의하기"] },
    { title: "기술 스택", items: ["React · Next.js", "FastAPI · PostgreSQL", "Redis · APScheduler", "Kakao / Naver Maps API"], mono: true },
  ];
  return (
    <footer className="flex gap-8 rounded-2xl bg-surface-primary p-12">
      <div className="flex flex-1 flex-col gap-3.5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent">
            <Flame size={18} className="text-fg-inverse" />
          </div>
          <span className="font-heading text-xl font-bold text-fg-primary">Foorendy</span>
        </div>
        <p className="font-body text-[13px] leading-[1.6] text-fg-secondary">
          SNS 에서 뜨는 음식을 내 주변에서 바로 찾고, 사장님은 재고와 수요를 관리하는 지도 기반 플랫폼.
        </p>
        <span className="font-body text-[11px] text-fg-muted">© 2026 Team Foorendy (Food + Trendy)</span>
      </div>
      {cols.map((c) => (
        <div key={c.title} className="flex w-[200px] flex-col gap-2.5">
          <span className="font-body text-xs font-bold text-fg-primary">{c.title}</span>
          {c.items.map((it) => (
            <span key={it} className={(c.mono ? "font-data" : "font-body") + " text-xs text-fg-secondary"}>
              {it}
            </span>
          ))}
        </div>
      ))}
    </footer>
  );
}

export default function Home() {
  const [trends, setTrends] = useState([]);
  const [nearby, setNearby] = useState([]);
  const [searchRank, setSearchRank] = useState([]);

  useEffect(() => {
    api.get("/trends?limit=10")
      .then((d) => {
        const list = d || [];
        setTrends(list);
        // 인기 검색어: Redis 기반 search-ranking 우선, 비면 트렌드 순위 변동으로 폴백
        api.get("/trends/search-ranking")
          .then((sr) => {
            if (sr?.length) {
              setSearchRank(sr.map((r) => ({ n: r.rank, name: r.name, delta: r.direction === "up" ? `▲ ${r.delta}` : `▼ ${Math.abs(r.delta)}`, up: r.direction === "up" })));
            } else {
              setSearchRank(list.slice(0, 5).map((t) => {
                const d = t.previous_rank == null ? 0 : t.previous_rank - t.rank;
                return { n: t.rank, name: t.name, delta: d > 0 ? `▲ ${d}` : d < 0 ? `▼ ${-d}` : "-", up: d > 0 };
              }));
            }
          })
          .catch(() => setSearchRank([]));
      })
      .catch(() => setTrends([]));

    api.get(`/stores?lat=${MY_LOCATION.lat}&lng=${MY_LOCATION.lng}&radius=5`)
      .then((d) => setNearby((d || []).slice(0, 6)))
      .catch(() => setNearby([]));
  }, []);

  return (
    <div className="flex min-h-screen w-full justify-center bg-surface-secondary">
      <div className="w-full max-w-canvas bg-surface-secondary">
        <TopNav active="트렌드" />
        <main className="flex flex-col gap-8 px-10 pb-10 pt-6">
          <Hero searchRank={searchRank} />

          <section className="flex flex-col gap-7 rounded-2xl bg-surface-primary p-10">
            <div className="flex flex-col gap-1.5">
              <h2 className="font-heading text-[28px] font-bold text-fg-primary">🔥 트렌디 푸드 랭킹</h2>
              <p className="font-body text-[13px] text-fg-secondary">
                일주일 간의 SNS 언급량 · 재게시 · 좋아요 · 증가율을 종합한 점수입니다.
              </p>
            </div>
            <div className="grid grid-cols-5 gap-5">
              {trends.map((t) => (
                // 트렌드 카드 클릭 → 지도에서 해당 트렌드 판매 매장으로 이동
                <Link key={t.trend_id} to={`/map?trend=${t.trend_id}`} className="block transition hover:-translate-y-0.5">
                  <TrendCard
                    rank={String(t.rank)}
                    emoji={emojiOf(t.name)}
                    image={t.image_url}
                    name={t.name}
                    stores={STATUS_KO[t.status] ?? ""}
                    score={t.trend_score != null ? String(t.trend_score) : "-"}
                    hot={HOT_BY_STATUS[t.status] ?? HOT}
                    delta={rankDelta(t)}
                  />
                </Link>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-6 rounded-2xl bg-surface-primary p-10">
            <div className="flex w-full items-center justify-between">
              <h2 className="font-heading text-2xl font-bold text-fg-primary">📍 지금 내 주변에서 판매중</h2>
              <Link to="/map" className="flex items-center gap-1.5 font-body text-[13px] font-semibold text-accent">
                지도로 보기 <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-3.5">
              {nearby.length === 0 && <span className="font-body text-xs text-fg-muted">주변 매장을 불러오는 중…</span>}
              {nearby.map((s) => (
                // 매장 카드 클릭 → 지도 탭에서 해당 매장 상세(팝오버) 열기
                <Link key={s.store_id} to={`/map?store=${s.store_id}`} className="block transition hover:-translate-y-0.5">
                  <StoreCard
                    emoji={emojiOf(s.trend?.name)}
                    name={s.name}
                    desc={s.featured_product ? `${s.featured_product.name} · ${Number(s.featured_product.price ?? 0).toLocaleString()}원` : "등록된 메뉴 없음"}
                    distance={s.distance_km != null ? `${s.distance_km} km` : ""}
                    time={timeAgo(s.featured_product?.stock_updated_at)}
                    stock={STOCK_PILL[s.featured_product?.stock_status] ?? STOCK_PILL.AVAILABLE}
                  />
                </Link>
              ))}
            </div>
          </section>

          <Footer />
        </main>
      </div>
    </div>
  );
}
