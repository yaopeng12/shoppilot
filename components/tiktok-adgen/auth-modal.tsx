"use client";

import { useEffect, useState } from "react";

import { Modal } from "@/components/ui/modal";
import { cn } from "@/components/ui/cn";
import { apiFetch } from "@/lib/tiktok-adgen/client";

export function AuthModal({
  open,
  initialMode = "login",
  onClose,
  onSuccess,
}: {
  open: boolean;
  initialMode?: "login" | "register";
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (open) setMode(initialMode);
  }, [open, initialMode]);

  async function submit() {
    setErr(null);
    if (!email || !password) {
      setErr("请输入邮箱和密码");
      return;
    }
    const endpoint =
      mode === "register" ? "/api/auth/register" : "/api/auth/login";
    const body =
      mode === "register" ? { email, password, name } : { email, password };
    const r = await apiFetch<{ error?: string }>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });
    if (!r.ok) {
      setErr(r.data.error || "登录/注册失败");
      return;
    }
    onSuccess();
    onClose();
  }

  return (
    <Modal open={open} title={mode === "login" ? "登录" : "注册"} onClose={onClose}>
      {err ? (
        <div className="text-sm text-rose-400 mb-4 flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 5v3M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          {err}
        </div>
      ) : null}
      <div className="space-y-3.5">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="邮箱"
          className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200 focus:border-violet-500/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-violet-500/20 hover:border-white/20"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="密码"
          type="password"
          className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200 focus:border-violet-500/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-violet-500/20 hover:border-white/20"
        />
        {mode === "register" ? (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="昵称（可选）"
            className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200 focus:border-violet-500/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-violet-500/20 hover:border-white/20"
          />
        ) : null}
        <button
          type="button"
          className={cn(
            "w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-[0.98]",
            "bg-white text-black hover:bg-white/90 shadow-lg shadow-white/10"
          )}
          onClick={submit}
        >
          {mode === "login" ? "登录" : "注册"}
        </button>
        <button
          type="button"
          className="w-full py-2.5 rounded-xl border border-white/[0.1] text-white/50 hover:text-white/80 hover:bg-white/[0.04] hover:border-white/20 transition-all duration-200 text-xs"
          onClick={() => setMode((m) => (m === "login" ? "register" : "login"))}
        >
          {mode === "login" ? "没有账号？去注册" : "已有账号？去登录"}
        </button>
      </div>
    </Modal>
  );
}
