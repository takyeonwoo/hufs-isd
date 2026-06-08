import { Link } from "react-router-dom";
import { Flame, ArrowRight } from "lucide-react";
import TopNav from "../components/TopNav.jsx";
import TrendCard from "../components/TrendCard.jsx";
import StoreCard from "../components/StoreCard.jsx";
import PrimaryButton from "../components/PrimaryButton.jsx";

const HOT = { label: "HOT", color: "#FF3D3D", bg: "#FFE5E5", icon: "flame" };
const RISING = { label: "RISING", color: "#F5A524", bg: "#FFF0DA", icon: "arrow-up-right" };
const FALLING = { label: "FALLING", color: "#888888", bg: "#EEEEEE", icon: "arrow-down" };
const up = (label) => ({ label, color: "#22A06B", bg: "#E6F6EF", icon: "arrow-up" });
const down = (label) => ({ label, color: "#888888", bg: "#F0F0F0", icon: "arrow-down" });
const NEW = { label: "NEW", color: "#7C3AED", bg: "#EDE9FE", icon: "sparkles" };

const trendCards = [
  { rank: "1", emoji: "🟣", name: "우베", stores: "27 매장", score: "98.2", hot: HOT, delta: up("1") },
  { rank: "2", emoji: "🍫", name: "두바이초콜릿", stores: "14 매장", score: "92.4", hot: HOT, delta: down("1") },
  { rank: "3", emoji: "🍡", name: "두쫀쿠", stores: "9 매장", score: "87.6", hot: HOT, delta: up("2") },
  { rank: "4", emoji: "🧈", name: "버터떡", stores: "22 매장", score: "81.0", hot: RISING, delta: up("3") },
  { rank: "5", emoji: "🥐", name: "크루키", stores: "18 매장", score: "73.5", hot: FALLING, delta: down("2") },
  { rank: "6", emoji: "🍰", name: "바스크치즈", stores: "31 매장", score: "68.9", hot: RISING, delta: up("2") },
  { rank: "7", emoji: "🍵", name: "말차푸딩", stores: "12 매장", score: "64.1", hot: RISING, delta: down("1") },
  { rank: "8", emoji: "🍩", name: "밤티라미수", stores: "7 매장", score: "58.7", hot: RISING, delta: up("1") },
  { rank: "9", emoji: "🍡", name: "약과쿠키", stores: "25 매장", score: "54.3", hot: FALLING, delta: down("5") },
  { rank: "10", emoji: "🍮", name: "흑임자라떼", stores: "11 매장", score: "51.2", hot: RISING, delta: NEW },
];

const SOLD_LOW = { label: "소량", color: "#F5A524", bg: "#FFF3D8" };
const SOLD_OUT = { label: "품절", color: "#888888", bg: "#F0F0F0" };

const nearby = [
  { emoji: "🟣", name: "연남 우베하우스", desc: "우베 케이크 · 6,800원", distance: "0.4 km", time: "10분 전 업데이트" },
  { emoji: "🍫", name: "두바이초콜릿 팩토리", desc: "두바이초콜릿 · 9,500원", distance: "0.7 km", time: "3분 전 업데이트", stock: SOLD_LOW },
  { emoji: "🍡", name: "망원 두쫀쿠", desc: "두쫀쿠 4개입 · 12,000원", distance: "1.2 km", time: "방금 업데이트" },
  { emoji: "🟣", name: "성수 우베 라떼바", desc: "우베 라떼 · 5,500원", distance: "0.9 km", time: "22분 전 업데이트" },
  { emoji: "🍰", name: "합정 디저트연구소", desc: "우베 카눌레 · 3,800원", distance: "1.1 km", time: "품절", stock: SOLD_OUT },
  { emoji: "🍫", name: "홍대 초콜릿하우스", desc: "두바이초콜릿 미니 · 6,000원", distance: "1.4 km", time: "35분 전 업데이트" },
];

const searchRank = [
  { n: "1", name: "우베", delta: "▲ 1", up: true },
  { n: "2", name: "두바이초콜릿", delta: "▼ 1", up: false },
  { n: "3", name: "두쫀쿠", delta: "▲ 2", up: true },
  { n: "4", name: "버터떡", delta: "▲ 3", up: true },
  { n: "5", name: "크루키", delta: "▼ 2", up: false },
];

function Hero() {
  return (
    <section className="flex gap-8 rounded-2xl bg-surface-inverse p-12">
      <div className="flex flex-1 flex-col gap-6">
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#1F1F1F] px-3.5 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          <span className="font-body text-[11px] font-semibold text-fg-inverse">
            LIVE TREND · 2026.05.26 14:00 업데이트
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
          <span className="font-data text-[11px] text-fg-muted">↻ 5초 전</span>
        </div>
        <div className="flex flex-col gap-2">
          {searchRank.map((r) => (
            <div key={r.n} className="flex w-full items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className={"font-data text-sm font-bold " + (r.n === "1" ? "text-accent" : "text-[#B0B0B0]")}>
                  {r.n}
                </span>
                <span className="font-body text-sm font-semibold text-fg-inverse">{r.name}</span>
              </div>
              <span className={"font-data text-xs font-bold " + (r.up ? "text-status-available" : "text-[#B0B0B0]")}>
                {r.delta}
              </span>
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
  return (
    <div className="flex min-h-screen w-full justify-center bg-surface-secondary">
      <div className="w-full max-w-canvas bg-surface-secondary">
        <TopNav active="트렌드" />
        <main className="flex flex-col gap-8 px-10 pb-10 pt-6">
          <Hero />

          <section className="flex flex-col gap-7 rounded-2xl bg-surface-primary p-10">
            <div className="flex flex-col gap-1.5">
              <h2 className="font-heading text-[28px] font-bold text-fg-primary">🔥 트렌디 푸드 랭킹</h2>
              <p className="font-body text-[13px] text-fg-secondary">
                일주일 간의 SNS 언급량 · 재게시 · 좋아요 · 증가율을 종합한 점수입니다.
              </p>
            </div>
            <div className="grid grid-cols-5 gap-5">
              {trendCards.map((c) => (
                <TrendCard key={c.rank} {...c} />
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
              {nearby.map((s) => (
                <StoreCard key={s.name} {...s} />
              ))}
            </div>
          </section>

          <Footer />
        </main>
      </div>
    </div>
  );
}
