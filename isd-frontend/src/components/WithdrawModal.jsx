import { useState } from "react";
import { UserX, AlertTriangle, Check } from "lucide-react";

/**
 * 회원 탈퇴 확인 모달 (UI.pen "10 회원 탈퇴")
 * 안내에 동의(체크)해야 탈퇴 버튼이 활성화된다.
 */
export default function WithdrawModal({
  open,
  onClose,
  user = { name: "김사장", initial: "김", meta: "hyma0214@gmail.com · 매장 1개 운영 중" },
  onConfirm,
}) {
  const [agreed, setAgreed] = useState(false);
  if (!open) return null;

  const close = () => {
    setAgreed(false);
    onClose?.();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A1ACC] px-4"
      onClick={close}
    >
      <div
        className="flex w-full max-w-[480px] flex-col items-center gap-5 rounded-2xl bg-surface-primary p-9 shadow-[0_16px_48px_#00000040]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FEE7E7]">
          <UserX size={28} className="text-[#E5484D]" />
        </div>

        <div className="flex w-full flex-col items-center gap-2">
          <h2 className="font-heading text-xl font-bold text-fg-primary">정말 탈퇴하시겠어요?</h2>
          <p className="text-center font-body text-[13px] leading-[1.5] text-fg-secondary">
            탈퇴하면 계정 정보와 등록한 매장이 모두 삭제되며 복구할 수 없어요.
          </p>
        </div>

        <div className="flex w-full items-center gap-3 rounded-xl bg-surface-secondary p-3.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent font-body text-[15px] font-bold text-fg-inverse">
            {user.initial}
          </span>
          <div className="flex flex-col gap-0.5">
            <span className="font-body text-sm font-bold text-fg-primary">{user.name}</span>
            <span className="font-body text-[11px] text-fg-muted">{user.meta}</span>
          </div>
        </div>

        <div className="flex w-full flex-col gap-2 rounded-xl bg-[#FEF6F6] p-4">
          <div className="flex w-full items-start gap-2">
            <AlertTriangle size={14} className="mt-0.5 shrink-0 text-[#E5484D]" />
            <span className="font-body text-xs font-medium leading-[1.5] text-[#9A2A2E]">
              운영 중인 매장이 즉시 비공개 처리되고 30일 후 영구 삭제됩니다.
            </span>
          </div>
        </div>

        <button
          onClick={() => setAgreed((v) => !v)}
          className="flex w-full items-center gap-2.5"
        >
          <span
            className={
              "flex h-[18px] w-[18px] items-center justify-center rounded-md " +
              (agreed ? "bg-[#E5484D]" : "border border-border-soft bg-surface-primary")
            }
          >
            {agreed && <Check size={12} className="text-white" />}
          </span>
          <span className="font-body text-xs font-semibold text-fg-primary">
            위 내용을 확인했으며 탈퇴에 동의합니다.
          </span>
        </button>

        <div className="flex w-full gap-2.5 pt-1">
          <button
            onClick={close}
            className="flex h-[50px] flex-1 items-center justify-center rounded-full bg-surface-secondary font-body text-sm font-bold text-fg-primary"
          >
            취소
          </button>
          <button
            disabled={!agreed}
            onClick={() => {
              onConfirm?.();
              close();
            }}
            className="flex h-[50px] flex-1 items-center justify-center gap-1.5 rounded-full bg-[#E5484D] font-body text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <UserX size={15} className="text-white" />
            회원 탈퇴
          </button>
        </div>
      </div>
    </div>
  );
}
