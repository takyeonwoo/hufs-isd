import { useState } from "react";
import { Trash2 } from "lucide-react";

/**
 * 매장 삭제 확인 모달 (UI.pen "09 매장 삭제")
 * 매장명을 정확히 입력해야 삭제 버튼이 활성화된다.
 */
export default function DeleteStoreModal({
  open,
  onClose,
  store = { name: "연남 우베하우스", emoji: "🟣", summary: "메뉴 5개 · 공지 1건 · 서울 마포구" },
  onConfirm,
}) {
  const [confirmText, setConfirmText] = useState("");
  if (!open) return null;

  const canDelete = confirmText.trim() === store.name;
  const close = () => {
    setConfirmText("");
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
          <Trash2 size={28} className="text-[#E5484D]" />
        </div>

        <div className="flex w-full flex-col items-center gap-2">
          <h2 className="font-heading text-xl font-bold text-fg-primary">매장을 삭제하시겠어요?</h2>
          <p className="text-center font-body text-[13px] leading-[1.5] text-fg-secondary">
            삭제하면 매장 정보, 메뉴, 재고, 공지가 모두 사라지며 복구할 수 없어요.
          </p>
        </div>

        <div className="flex w-full items-center gap-3 rounded-xl bg-surface-secondary p-3.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F3D9FF] text-lg">
            {store.emoji}
          </span>
          <div className="flex flex-col gap-0.5">
            <span className="font-body text-sm font-bold text-fg-primary">{store.name}</span>
            <span className="font-body text-[11px] text-fg-muted">{store.summary}</span>
          </div>
        </div>

        <div className="flex w-full flex-col gap-2">
          <span className="font-body text-xs font-semibold text-fg-secondary">
            삭제하려면 매장명을 입력하세요
          </span>
          <input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={store.name}
            className="h-12 w-full rounded-xl border border-border-soft bg-surface-primary px-4 font-body text-[13px] text-fg-primary outline-none placeholder:text-fg-muted focus:border-[#E5484D]"
          />
        </div>

        <div className="flex w-full gap-2.5 pt-1">
          <button
            onClick={close}
            className="flex h-[50px] flex-1 items-center justify-center rounded-full bg-surface-secondary font-body text-sm font-bold text-fg-primary"
          >
            취소
          </button>
          <button
            disabled={!canDelete}
            onClick={() => {
              onConfirm?.();
              close();
            }}
            className="flex h-[50px] flex-1 items-center justify-center gap-1.5 rounded-full bg-[#E5484D] font-body text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 size={15} className="text-white" />
            매장 삭제
          </button>
        </div>
      </div>
    </div>
  );
}
