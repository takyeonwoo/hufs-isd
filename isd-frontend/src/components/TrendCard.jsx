import { Flame, ArrowUp, ArrowDown, ArrowUpRight, Sparkles } from "lucide-react";

const iconMap = { flame: Flame, "arrow-up": ArrowUp, "arrow-down": ArrowDown, "arrow-up-right": ArrowUpRight, sparkles: Sparkles };

/**
 * Component/TrendCard
 * hot:   { label, color, bg, icon }
 * delta: { label, color, bg, icon }
 */
export default function TrendCard({
  rank = "1",
  emoji = "🍪",
  name = "두바이초콜릿",
  stores = "14 매장",
  score = "92.4",
  hot = { label: "HOT", color: "#FF3D3D", bg: "#FFE5E5", icon: "flame" },
  delta = { label: "+18%", color: "#22A06B", bg: "#E6F6EF", icon: "arrow-up" },
}) {
  const HotIcon = iconMap[hot.icon] || Flame;
  const DeltaIcon = iconMap[delta.icon] || ArrowUp;

  return (
    <div className="flex h-[320px] w-full flex-col overflow-hidden rounded-2xl bg-surface-primary shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      {/* card image */}
      <div className="flex h-[180px] flex-col justify-between bg-surface-warm p-4">
        <div className="flex w-full items-center justify-between">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-inverse">
            <span className="font-data text-base font-bold text-fg-inverse">{rank}</span>
          </div>
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1"
            style={{ backgroundColor: hot.bg }}
          >
            <HotIcon size={12} style={{ color: hot.color }} />
            <span className="font-body text-[11px] font-bold" style={{ color: hot.color }}>
              {hot.label}
            </span>
          </span>
        </div>
        <div className="flex w-full items-center justify-center">
          <span className="text-[64px] leading-none">{emoji}</span>
        </div>
      </div>
      {/* card info */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <div className="flex flex-col gap-1">
          <span className="font-heading text-lg font-bold text-fg-primary">{name}</span>
          <span className="font-body text-xs text-fg-muted">{stores}</span>
        </div>
        <div className="flex w-full items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="font-body text-[10px] text-fg-muted">트렌드 점수</span>
            <span className="font-data text-lg font-bold text-fg-primary">{score}</span>
          </div>
          <span
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1"
            style={{ backgroundColor: delta.bg }}
          >
            <DeltaIcon size={10} style={{ color: delta.color }} />
            <span className="font-data text-[11px] font-bold" style={{ color: delta.color }}>
              {delta.label}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
