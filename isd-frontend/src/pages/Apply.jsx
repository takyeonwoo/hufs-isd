import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, BadgeCheck, Search, Upload, Send } from "lucide-react";
import TopNav from "../components/TopNav.jsx";
import { api } from "../lib/api.js";
import { supabase } from "../lib/supabase.js";

// 다음(카카오) 우편번호 서비스 — 키 불필요. 최초 1회만 스크립트 로드.
function loadPostcode() {
  return new Promise((resolve, reject) => {
    if (window.daum?.Postcode || window.kakao?.Postcode) return resolve();
    const s = document.createElement("script");
    s.src = "https://t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("주소 검색 서비스를 불러오지 못했습니다."));
    document.head.appendChild(s);
  });
}

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
  const [form, setForm] = useState({ applicant_name: "", cafe_name: "", address: "", phone: "", business_reg_no: "" });
  const [file, setFile] = useState(null);
  const [termsAgreed, setTermsAgreed] = useState(true);
  const [marketing, setMarketing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [userEmail, setUserEmail] = useState(null); // null=로딩, ""=이메일없음(카카오 등)

  // 로그인한 사용자의 이메일 (Supabase 세션)
  useEffect(() => {
    supabase.auth.getUser()
      .then(({ data }) => setUserEmail(data?.user?.email ?? ""))
      .catch(() => setUserEmail(""));
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // 주소 검색 팝업 → 선택 시 도로명 주소를 form.address 에 채움
  const openPostcode = async () => {
    try {
      await loadPostcode();
      const Postcode = window.daum?.Postcode || window.kakao?.Postcode;
      new Postcode({
        oncomplete: (data) => setForm((f) => ({ ...f, address: data.roadAddress || data.address })),
      }).open();
    } catch (e) {
      alert(e.message);
    }
  };

  const submit = async () => {
    setError(null);
    if (!form.applicant_name.trim() || !form.cafe_name.trim() || !form.address.trim() || !form.business_reg_no.trim()) {
      setError("필수 항목(신청자 이름·카페 이름·주소·사업자등록번호)을 입력해주세요.");
      return;
    }
    if (!termsAgreed) {
      setError("입점 약관에 동의해주세요.");
      return;
    }
    setSubmitting(true);
    try {
      // (27) 사업자등록증 업로드 → URL 확보
      let business_license_url = "";
      if (file) {
        const up = await api.upload("/uploads/business-license", file);
        business_license_url = up?.business_license_url ?? "";
      }
      // (21) 입점 신청 제출
      await api.post("/applications", {
        applicant_name: form.applicant_name.trim(),
        cafe_name: form.cafe_name.trim(),
        address: form.address.trim(),
        phone: form.phone.trim() || null,
        business_reg_no: form.business_reg_no.trim(),
        business_license_url,
        terms_agreed_at: new Date().toISOString(),
        marketing_agreed: marketing,
      });
      navigate("/apply/complete");
    } catch (e) {
      setError(e.message || "신청 제출에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

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
              <span className="font-body text-[13px] font-semibold text-[#1F3F8A]">
                {userEmail === null ? "로그인 정보를 불러오는 중…" : userEmail ? `${userEmail} 으로 로그인됨` : "소셜 계정으로 로그인됨"}
              </span>
            </div>

            <Field label="신청자 이름" required>
              <input className={inputCls} placeholder="대표자(사장님) 성함" value={form.applicant_name} onChange={set("applicant_name")} />
            </Field>

            <Field label="카페 이름" required>
              <input className={inputCls} placeholder="운영 중인 카페 이름" value={form.cafe_name} onChange={set("cafe_name")} />
            </Field>

            <Field label="매장 주소" required>
              <div className="flex h-12 w-full items-center justify-between rounded-xl border border-border-soft bg-surface-primary px-4">
                <input className="flex-1 bg-transparent font-body text-[13px] text-fg-primary outline-none placeholder:text-fg-muted" placeholder="주소 검색을 눌러 입력하세요" value={form.address} readOnly onClick={openPostcode} />
                <button type="button" onClick={openPostcode} className="flex h-8 items-center gap-1.5 rounded-full bg-surface-secondary px-3.5">
                  <Search size={12} className="text-fg-secondary" />
                  <span className="font-body text-xs font-bold text-fg-secondary">주소 검색</span>
                </button>
              </div>
            </Field>

            <Field label="매장 연락처">
              <input className={inputCls} placeholder="02-1234-5678" value={form.phone} onChange={set("phone")} />
            </Field>

            <Field label="사업자등록번호" required hint="등록번호 10자리를 입력해주세요">
              <input className={inputCls + " font-data"} placeholder="000-00-00000" value={form.business_reg_no} onChange={set("business_reg_no")} />
            </Field>

            <Field label="사업자등록증 사본" required>
              <label className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-border-soft bg-surface-secondary p-6">
                <Upload size={28} className="text-accent" />
                <span className="font-body text-[13px] font-bold text-fg-primary">
                  {file ? file.name : "파일을 끌어다 놓거나 클릭하여 업로드"}
                </span>
                <span className="font-body text-[11px] font-medium text-fg-muted">PDF, JPG, PNG · 최대 10MB</span>
                <input
                  type="file"
                  accept="application/pdf,image/jpeg,image/png"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </label>
            </Field>

            <div className="flex flex-col gap-2.5 pt-2">
              <button type="button" onClick={() => setTermsAgreed((v) => !v)} className="flex w-full items-center gap-2.5 text-left">
                <span className={"flex h-[18px] w-[18px] items-center justify-center rounded-md " + (termsAgreed ? "bg-accent" : "border border-border-soft bg-surface-primary")}>
                  {termsAgreed && <Check size={12} className="text-fg-inverse" />}
                </span>
                <span className="font-body text-xs font-semibold text-fg-primary">입점 약관 및 개인정보 처리방침에 동의합니다</span>
                <span className="font-body text-[11px] font-bold text-accent">(필수)</span>
              </button>
              <button type="button" onClick={() => setMarketing((v) => !v)} className="flex w-full items-center gap-2.5 text-left">
                <span className={"flex h-[18px] w-[18px] items-center justify-center rounded-md " + (marketing ? "bg-accent" : "border border-border-soft bg-surface-primary")}>
                  {marketing && <Check size={12} className="text-fg-inverse" />}
                </span>
                <span className="font-body text-xs font-medium text-fg-secondary">매장 트렌드 분석 결과 이메일 수신에 동의합니다</span>
                <span className="font-body text-[11px] font-semibold text-fg-muted">(선택)</span>
              </button>
            </div>

            {error && (
              <div className="rounded-xl bg-[#FEE7E7] px-4 py-3 font-body text-[13px] font-semibold text-[#C0392B]">{error}</div>
            )}

            <button
              onClick={submit}
              disabled={submitting}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-accent disabled:opacity-60"
            >
              <Send size={16} className="text-fg-inverse" />
              <span className="font-body text-sm font-bold text-fg-inverse">{submitting ? "제출 중…" : "입점 신청 제출하기"}</span>
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
