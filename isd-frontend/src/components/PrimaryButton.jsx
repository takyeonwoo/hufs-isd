/** Component/PrimaryButton */
export default function PrimaryButton({ children = "버튼", className = "", icon, ...props }) {
  return (
    <button
      className={
        "inline-flex h-11 items-center justify-center gap-2 rounded-full bg-accent px-[22px] font-body text-sm font-semibold text-fg-inverse transition hover:opacity-90 " +
        className
      }
      {...props}
    >
      {children}
      {icon}
    </button>
  );
}
