"use client";

import { useState } from "react";

import { Modal } from "@/components/ui/modal";
import { cn } from "@/components/ui/cn";
import { apiFetch } from "@/lib/tiktok-adgen/client";
import type { TeamState } from "./types";

export function TeamModal({
  open,
  teamState,
  onClose,
  onRefresh,
  onToast,
}: {
  open: boolean;
  teamState: TeamState;
  onClose: () => void;
  onRefresh: () => Promise<void>;
  onToast: (msg: string) => void;
}) {
  const [teamName, setTeamName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");

  async function createTeam() {
    const r = await apiFetch<{ error?: string }>("/api/team/create", {
      method: "POST",
      body: JSON.stringify({ name: teamName }),
    });
    if (r.ok) {
      onToast("团队已创建");
      await onRefresh();
    } else {
      onToast(r.data.error || "创建失败");
    }
  }

  async function inviteMember() {
    const r = await apiFetch<{ error?: string }>("/api/team/invite", {
      method: "POST",
      body: JSON.stringify({ email: inviteEmail }),
    });
    if (r.ok) {
      onToast("已邀请");
      setInviteEmail("");
    } else {
      onToast(r.data.error || "邀请失败");
    }
  }

  return (
    <Modal
      open={open}
      title="团队管理"
      onClose={onClose}
      className="max-w-lg"
    >
      {teamState && "_empty" in teamState && teamState._empty ? (
        <div className="space-y-4">
          <div className="text-sm text-white/45">
            你还没有团队，创建一个：
          </div>
          <input
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="团队名称"
            className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200 focus:border-violet-500/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-violet-500/20 hover:border-white/20"
          />
          <button
            type="button"
            className="w-full py-3 rounded-xl bg-white text-black text-sm font-semibold hover:bg-white/90 transition-all duration-200 active:scale-[0.98] shadow-lg shadow-white/10"
            onClick={createTeam}
          >
            创建团队
          </button>
        </div>
      ) : teamState && !("_empty" in teamState) ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">{teamState.name}</div>
            <div className="text-xs text-white/35 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.06]">
              {teamState.members?.length || 0}/10
            </div>
          </div>
          <div className="space-y-2">
            {(teamState.memberDetails || []).map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-3 rounded-xl bg-white/[0.02] border border-white/[0.06] p-3.5"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500/30 to-blue-500/30 flex items-center justify-center text-xs font-medium text-white/70">
                  {(m.name || m.email || "?")[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">
                    {m.name || m.email}
                  </div>
                  <div className="text-[11px] text-white/30 truncate">
                    {m.email}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="成员邮箱"
              className="flex-1 bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200 focus:border-violet-500/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-violet-500/20 hover:border-white/20"
            />
            <button
              type="button"
              className="px-5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-white/90 transition-all duration-200 active:scale-[0.97] shadow-lg shadow-white/10 shrink-0"
              onClick={inviteMember}
            >
              邀请
            </button>
          </div>
        </div>
      ) : (
        <div className="text-sm text-white/30 text-center py-8">
          加载中...
        </div>
      )}
    </Modal>
  );
}
