import { MapPin, Timer } from "lucide-react";

/**
 * Component/StoreCard
 * stock: { label, color, bg }
 */
export default function StoreCard({
  emoji = "🥐",
  image = null,
  thumbBg = "#F5F1FF",
  name = "연남 우베하우스",
  desc = "우베 케이크 · 6,800원",
  distance = "0.4 km",
  time = "10분 전 업데이트",
  stock = { label: "판매중", color: "#22A06B", bg: "#E6F6EF" },
}) {
  return (
    <div className="flex h-32 w-full gap-3.5 rounded-xl bg-surface-primary p-3.5">
      <div
        className="flex h-[100px] w-[100px] shrink-0 items-center justify-center overflow-hidden rounded-lg"
        style={{ backgroundColor: thumbBg }}
      >
        {image ? (
          <img src={image} alt={name} className="h-full w-full object-cover" />
        ) : emoji ? (
          <span className="text-[40px] leading-none">{emoji}</span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col justify-between py-0.5">
        <div className="flex flex-col gap-1">
          <div className="flex w-full items-center justify-between gap-2">
            <span className="font-heading text-[15px] font-bold text-fg-primary">{name}</span>
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-[3px]"
              style={{ backgroundColor: stock.bg }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: stock.color }} />
              <span className="font-body text-[11px] font-semibold" style={{ color: stock.color }}>
                {stock.label}
              </span>
            </span>
          </div>
          <span className="font-body text-xs text-fg-secondary">{desc}</span>
        </div>
        <div className="flex w-full items-center gap-2.5">
          <span className="inline-flex items-center gap-1">
            <MapPin size={12} className="text-fg-muted" />
            <span className="font-data text-[11px] text-fg-muted">{distance}</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <Timer size={12} className="text-fg-muted" />
            <span className="font-body text-[11px] text-fg-muted">{time}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
