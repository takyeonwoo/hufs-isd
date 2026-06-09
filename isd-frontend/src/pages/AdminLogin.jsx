import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, User, Lock, Eye, EyeOff, ArrowRight, Info, ArrowLeft } from "lucide-react";
import { api } from "../lib/api.js";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false); // (4) 비밀번호 표시 토글
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // 관리자 로그인 → 백엔드 고정계정 인증(/auth/admin-login) → JWT 저장
  async function handleLogin() {
    setError(null);
    setLoading(true);
    try {
      const { access_token } = await api.post("/auth/admin-login", { username: email, password });
      api.setAdminToken(access_token);
      navigate("/admin");
    } catch (e) {
      setError(e.message || "로그인에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-surface-inverse p-6">
      <div className="flex w-[440px] flex-col gap-6 rounded-2xl bg-surface-primary p-12">
        <div className="flex flex-col items-center gap-3.5">
          <div className="flex h-[52px] w-[52px] items-center justify-center rounded-xl bg-surface-inverse">
            <ShieldCheck size={26} className="text-accent" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <h1 className="font-heading text-[26px] font-bold text-fg-primary">관리자 로그인</h1>
            <p className="font-body text-[13px] text-fg-secondary">Foorendy 입점 심사 관리 콘솔</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-body text-xs font-semibold text-fg-secondary">관리자 ID</label>
          <div className="flex h-[50px] items-center gap-2.5 rounded-xl border border-border-soft bg-surface-primary px-4">
            <User size={16} className="text-fg-muted" />
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="flex-1 bg-transparent font-body text-[13px] text-fg-primary outline-none placeholder:text-fg-muted" placeholder="admin" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-body text-xs font-semibold text-fg-secondary">비밀번호</label>
          <div className="flex h-[50px] items-center justify-between rounded-xl border border-accent bg-surface-primary px-4">
            <div className="flex items-center gap-2.5">
              <Lock size={16} className="text-fg-secondary" />
              <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()} placeholder="비밀번호" className="bg-transparent font-data text-sm font-bold text-fg-primary outline-none" />
            </div>
            <button type="button" onClick={() => setShowPw((v) => !v)} title={showPw ? "비밀번호 숨기기" : "비밀번호 표시"}>
              {showPw ? <Eye size={16} className="text-fg-secondary" /> : <EyeOff size={16} className="text-fg-muted" />}
            </button>
          </div>
        </div>

        {error && <p className="font-body text-[12px] font-semibold text-[#C0392B]">{error}</p>}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-accent disabled:opacity-60"
        >
          <span className="font-body text-sm font-bold text-fg-inverse">{loading ? "로그인 중…" : "로그인"}</span>
          <ArrowRight size={16} className="text-fg-inverse" />
        </button>

        <div className="flex items-center justify-center gap-2">
          <Info size={13} className="text-fg-muted" />
          <span className="font-body text-[11px] text-fg-muted">관리자 계정은 내부 운영팀만 발급됩니다.</span>
        </div>

        <Link to="/login" className="flex items-center justify-center gap-1.5">
          <ArrowLeft size={13} className="text-fg-secondary" />
          <span className="font-body text-xs font-semibold text-fg-secondary">사장님 로그인으로 돌아가기</span>
        </Link>
      </div>
    </div>
  );
}
