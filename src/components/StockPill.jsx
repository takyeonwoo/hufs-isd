/** Component/StockPill */
export default function StockPill({ label = "판매중", color = "#22A06B", bg = "#E6F6EF" }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1"
      style={{ backgroundColor: bg }}
    >
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      <span className="font-body text-[11px] font-semibold" style={{ color }}>
        {label}
      </span>
    </span>
  );
}
