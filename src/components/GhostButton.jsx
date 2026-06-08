/** Component/GhostButton */
export default function GhostButton({ children = "버튼", className = "", icon, ...props }) {
  return (
    <button
      className={
        "inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border-soft bg-surface-primary px-[22px] font-body text-sm font-semibold text-fg-primary transition hover:bg-surface-secondary " +
        className
      }
      {...props}
    >
      {children}
      {icon}
    </button>
  );
}
