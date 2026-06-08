import { Link, useNavigate } from "react-router-dom";
import { Check, BadgeCheck, Search, Upload, Send } from "lucide-react";
import TopNav from "../components/TopNav.jsx";

function Step({ n, label, state }) {
  // state: "done" | "active" | "todo"
  const dot =
    state === "done" ? (
      <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-accent-soft">
        <Check size={12} className="text-accent" />
      </span>
    ) : state === "active" ? (
      <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-accent font-data text-[11px] font-bold text-fg-inverse">{n}</span>
    ) : (
      <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-surface-secondary font-data text-[11px] font-bold text-fg-muted">{n}</span>
    );
  const txtColor = state === "done" ? "text-accent" : state === "active" ? "text-fg-primary" : "text-fg-muted";
  return (
    <span className="flex items-center gap-2">
      {dot}
      <span className={"font-body text-xs font-bold " + txtColor}>{label}</span>
    </span>
  );
}

function Field({ label, required, children, hint }) {
  return (
    <div className="flex flex-1 flex-col gap-2">
      <span className="flex items-center gap-1">
        <span className="font-body text-xs font-semibold text-fg-primary">{label}</span>
        {required && <span className="font-body text-xs font-bold text-accent">*</span>}
      </span>
      {children}
      {hint && <span className="font-body text-[11px] text-fg-muted">{hint}</span>}
    </div>
  );
}

const inputCls = "h-12 w-full rounded-xl border border-border-soft bg-surface-primary px-4 font-body text-[13px] text-fg-primary outline-none placeholder:text-fg-muted";

export default function Apply() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen w-full justify-center bg-surface-secondary">
      <div className="flex w-full max-w-canvas flex-col bg-surface-secondary">
        <TopNav active="" />
        <div className="flex flex-1 items-center justify-center px-10 py-12">
          <div className="flex w-[720px] flex-col gap-6 rounded-2xl bg-surface-primary p-12">
            <div className="flex flex-col items-center gap-2.5">
              <h1 className="font-heading text-[30px] font-bold text-fg-primary">입점 신청</h1>
              <p className="text-center font-body text-[13px] text-fg-secondary">매장 정보와 사업자등록증을 제출하면 검수 후 1-2일 내 입점이 완료돼요.</p>
            </div>

            <div className="flex items-center justify-center gap-2 py-1">
              <Step n="1" label="회원가입" state="done" />
              <span className="h-px w-6 bg-border-soft" />
              <Step n="2" label="입점 신청" state="active" />
              <span className="h-px w-6 bg-border-soft" />
              <Step n="3" label="심사 완료" state="todo" />
            </div>

            <div className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#EEF4FF] px-4 py-3.5">
              <BadgeCheck size={14} className="text-[#1F5DC8]" />
              <span className="font-body text-[13px] font-semibold text-[#1F3F8A]">hyma0214@gmail.com 으로 로그인됨</span>
            </div>

            <Field label="카페 이름" required>
              <input className={inputCls} placeholder="운영 중인 카페 이름" />
            </Field>

            <Field label="매장 주소" required>
              <div className="flex h-12 w-full items-center justify-between rounded-xl border border-border-soft bg-surface-primary px-4">
                <input className="flex-1 bg-transparent font-body text-[13px] text-fg-primary outline-none placeholder:text-fg-muted" placeholder="서울특별시 마포구 ..." />
                <span className="flex h-8 items-center gap-1.5 rounded-full bg-surface-secondary px-3.5">
                  <Search size={12} className="text-fg-secondary" />
                  <span className="font-body text-xs font-bold text-fg-secondary">주소 검색</span>
                </span>
              </div>
            </Field>

            <Field label="매장 연락처">
              <input className={inputCls} placeholder="02-1234-5678" />
            </Field>

            <Field label="사업자등록번호" required hint="등록번호 10자리를 입력해주세요">
              <input className={inputCls + " font-data"} placeholder="000-00-00000" />
            </Field>

            <Field label="사업자등록증 사본" required>
              <div className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-border-soft bg-surface-secondary p-6">
                <Upload size={28} className="text-accent" />
                <span className="font-body text-[13px] font-bold text-fg-primary">파일을 끌어다 놓거나 클릭하여 업로드</span>
                <span className="font-body text-[11px] font-medium text-fg-muted">PDF, JPG, PNG · 최대 10MB</span>
              </div>
            </Field>

            <div className="flex flex-col gap-2.5 pt-2">
              <div className="flex w-full items-center gap-2.5">
                <span className="flex h-[18px] w-[18px] items-center justify-center rounded-md bg-accent">
                  <Check size={12} className="text-fg-inverse" />
                </span>
                <span className="font-body text-xs font-semibold text-fg-primary">입점 약관 및 개인정보 처리방침에 동의합니다</span>
                <span className="font-body text-[11px] font-bold text-accent">(필수)</span>
              </div>
              <div className="flex w-full items-center gap-2.5">
                <span className="h-[18px] w-[18px] rounded-md border border-border-soft bg-surface-primary" />
                <span className="font-body text-xs font-medium text-fg-secondary">매장 트렌드 분석 결과 이메일 수신에 동의합니다</span>
                <span className="font-body text-[11px] font-semibold text-fg-muted">(선택)</span>
              </div>
            </div>

            <button
              onClick={() => navigate("/apply/complete")}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-accent"
            >
              <Send size={16} className="text-fg-inverse" />
              <span className="font-body text-sm font-bold text-fg-inverse">입점 신청 제출하기</span>
            </button>

            <div className="flex w-full items-center justify-center gap-1.5">
              <span className="font-body text-xs text-fg-muted">신청 전에 매장 정보를 다시 확인해보세요.</span>
              <Link to="/login" className="font-body text-xs font-bold text-accent">이전으로</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
