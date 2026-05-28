"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useI18n } from "@/lib/i18n/context";
import { LangSwitch } from "@/components/tiktok-adgen/lang-switch";

const buttonClass =
  "w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-white/[0.1] bg-white/[0.04] text-white hover:bg-white/[0.08] transition-all duration-200";

type Mode = "login" | "register" | "verify";

type ApiResult = {
  ok?: boolean;
  error?: string;
  message?: string;
  devCode?: string;
};

const copy = {
  en: {
    welcome: "Welcome Back",
    createAccount: "Create Account",
    verifyEmail: "Verify Email",
    subtitle: "Use email and password",
    verifySubtitle: "Enter the code sent to your email",
    login: "Login",
    register: "Register",
    name: "Name",
    email: "you@example.com",
    password: "Password",
    code: "6-digit code",
    loginWithEmail: "Login with Email",
    createButton: "Create Account",
    working: "Working...",
    verifying: "Verifying...",
    verifyAndLogin: "Verify and Login",
    changeEmail: "Change email",
    or: "or",
    google: "Continue with Google",
    github: "Continue with GitHub",
    wechat: "Continue with WeChat",
    devCode: "Development code",
    loginError: "Email or password is incorrect, or the email is not verified.",
    createError: "Could not create account.",
    verifyError: "Could not verify email.",
    errors: {
      invalid_email: "Enter a valid email address.",
      weak_password: "Password must be at least 8 characters.",
      account_exists: "An account already exists for this email.",
      code_not_found: "Request a new verification code.",
      code_expired: "That code has expired.",
      invalid_code: "That code is not correct.",
      email_send_failed: "Could not send verification email.",
    },
  },
  zh: {
    welcome: "欢迎回来",
    createAccount: "创建账号",
    verifyEmail: "验证邮箱",
    subtitle: "使用邮箱和密码登录",
    verifySubtitle: "输入发送到邮箱的验证码",
    login: "登录",
    register: "注册",
    name: "姓名",
    email: "you@example.com",
    password: "密码",
    code: "6 位验证码",
    loginWithEmail: "邮箱登录",
    createButton: "创建账号",
    working: "处理中...",
    verifying: "验证中...",
    verifyAndLogin: "验证并登录",
    changeEmail: "修改邮箱",
    or: "或",
    google: "使用 Google 继续",
    github: "使用 GitHub 继续",
    wechat: "使用微信继续",
    devCode: "开发环境验证码",
    loginError: "邮箱或密码不正确，或邮箱尚未验证。",
    createError: "无法创建账号。",
    verifyError: "无法验证邮箱。",
    errors: {
      invalid_email: "请输入有效的邮箱地址。",
      weak_password: "密码至少需要 8 位。",
      account_exists: "这个邮箱已经注册过。",
      code_not_found: "请重新获取验证码。",
      code_expired: "验证码已过期。",
      invalid_code: "验证码不正确。",
      email_send_failed: "验证码邮件发送失败。",
    },
  },
} as const;

export function SignInForm({ showWeChat }: { showWeChat: boolean }) {
  const { locale } = useI18n();
  const t = copy[locale];
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const normalizedEmail = email.trim().toLowerCase();

  async function login() {
    const result = await signIn("email-password", {
      email: normalizedEmail,
      password,
      redirect: false,
      callbackUrl: "/",
    });

    if (result?.error) {
      setError(t.loginError);
      return;
    }

    window.location.href = result?.url || "/";
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    await login();
    setIsSubmitting(false);
  }

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setDevCode("");
    setIsSubmitting(true);

    const res = await fetch("/api/auth/email/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: normalizedEmail, password, name }),
    });
    const data = (await res.json()) as ApiResult;
    setIsSubmitting(false);

    if (!res.ok) {
      setError((data.error && t.errors[data.error as keyof typeof t.errors]) || data.message || t.createError);
      return;
    }

    if (data.devCode) setDevCode(data.devCode);
    setMode("verify");
  }

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const res = await fetch("/api/auth/email/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: normalizedEmail, code }),
    });
    const data = (await res.json()) as ApiResult;

    if (!res.ok) {
      setIsSubmitting(false);
      setError((data.error && t.errors[data.error as keyof typeof t.errors]) || data.message || t.verifyError);
      return;
    }

    await login();
    setIsSubmitting(false);
  }

  function switchMode(nextMode: Mode) {
    setMode(nextMode);
    setError("");
  }

  const isLogin = mode === "login";
  const isRegister = mode === "register";
  const title = mode === "verify" ? t.verifyEmail : isLogin ? t.welcome : t.createAccount;
  const subtitle = mode === "verify" ? t.verifySubtitle : t.subtitle;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-[#0c0c10]/95 border border-white/[0.1] shadow-2xl shadow-black/50 backdrop-blur-xl rounded-2xl p-8">
          <div className="mb-6 flex justify-end">
            <LangSwitch />
          </div>
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            <p className="mt-2 text-sm text-white/40">{subtitle}</p>
          </div>

          {mode !== "verify" && (
            <div className="mb-5 grid grid-cols-2 rounded-xl border border-white/[0.1] bg-white/[0.03] p-1">
              <button
                type="button"
                onClick={() => switchMode("login")}
                className={`rounded-lg px-3 py-2 text-sm transition ${isLogin ? "bg-white text-black" : "text-white/55 hover:text-white"}`}
              >
                {t.login}
              </button>
              <button
                type="button"
                onClick={() => switchMode("register")}
                className={`rounded-lg px-3 py-2 text-sm transition ${isRegister ? "bg-white text-black" : "text-white/55 hover:text-white"}`}
              >
                {t.register}
              </button>
            </div>
          )}

          {mode === "verify" ? (
            <form onSubmit={handleVerify} className="space-y-3">
              <p className="text-sm text-white/45">{normalizedEmail}</p>
              <input
                type="text"
                inputMode="numeric"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder={t.code}
                className="w-full rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-white/30 focus:bg-white/[0.07]"
              />
              {devCode && <p className="text-xs text-white/35">{t.devCode}: {devCode}</p>}
              {error && <p className="text-sm text-red-300">{error}</p>}
              <button type="submit" disabled={isSubmitting} className={`${buttonClass} disabled:cursor-not-allowed disabled:opacity-60`}>
                {isSubmitting ? t.verifying : t.verifyAndLogin}
              </button>
              <button type="button" onClick={() => switchMode("register")} className="w-full py-2 text-sm text-white/45 hover:text-white">
                {t.changeEmail}
              </button>
            </form>
          ) : (
            <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-3">
              {isRegister && (
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder={t.name}
                  autoComplete="name"
                  className="w-full rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-white/30 focus:bg-white/[0.07]"
                />
              )}
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={t.email}
                autoComplete="email"
                className="w-full rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-white/30 focus:bg-white/[0.07]"
              />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={t.password}
                autoComplete={isLogin ? "current-password" : "new-password"}
                className="w-full rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-white/30 focus:bg-white/[0.07]"
              />
              {error && <p className="text-sm text-red-300">{error}</p>}
              <button type="submit" disabled={isSubmitting} className={`${buttonClass} disabled:cursor-not-allowed disabled:opacity-60`}>
                {isSubmitting ? t.working : isLogin ? t.loginWithEmail : t.createButton}
              </button>
            </form>
          )}

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/[0.08]" />
            <span className="text-xs text-white/25">{t.or}</span>
            <div className="h-px flex-1 bg-white/[0.08]" />
          </div>

          <div className="space-y-3">
            <a href="/auth/start/google" className={buttonClass}>
              {t.google}
            </a>

            <a href="/auth/start/github" className={buttonClass}>
              {t.github}
            </a>

            {showWeChat && (
              <a href="/auth/start/wechat" className={buttonClass}>
                {t.wechat}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
