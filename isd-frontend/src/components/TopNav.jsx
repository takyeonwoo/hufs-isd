import { Flame, Search } from "lucide-react";
import { Link } from "react-router-dom";

const links = [
  { label: "트렌드", to: "/" },
  { label: "지도", to: "/map" },
  { label: "사장님 대시보드", to: "/dashboard" },
];

/**
 * Component/TopNav
 * @param {string} active - which nav link is highlighted ("트렌드" | "지도" | "사장님 대시보드")
 */
export default function TopNav({ active = "트렌드" }) {
  return (
    <header className="flex h-[72px] w-full items-center justify-between bg-surface-primary px-10 py-5">
      <div className="flex items-center gap-10">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent">
            <Flame size={18} className="text-fg-inverse" />
          </div>
          <span className="font-heading text-[22px] font-bold text-fg-primary">
            Foorendy
          </span>
        </Link>
        <nav className="flex items-center gap-7">
          {links.map((l) => {
            const isActive = l.label === active;
            return (
              <Link
                key={l.label}
                to={l.to}
                className={
                  "font-body text-sm " +
                  (isActive
                    ? "font-semibold text-accent"
                    : "font-medium text-fg-secondary hover:text-fg-primary")
                }
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-[260px] items-center gap-2 rounded-full bg-surface-secondary px-4">
          <Search size={16} className="text-fg-muted" />
          <span className="font-body text-[13px] text-fg-muted">
            음식이나 매장 검색
          </span>
        </div>
      </div>
    </header>
  );
}
