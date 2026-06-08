import { TrendingUp } from "lucide-react";

/** Component/TrendPill */
export default function TrendPill({ label = "HOT", color = "#FF3D3D", bg = "#FFE5E5" }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1"
      style={{ backgroundColor: bg }}
    >
      <TrendingUp size={12} style={{ color }} />
      <span className="font-body text-[11px] font-bold" style={{ color }}>
        {label}
      </span>
    </span>
  );
}
