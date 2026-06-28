// src/app/citizen/communities/MemberList.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { fetchCommunityMembers, updateMemberRole } from "@/app/actions/communityActions";

interface Member {
  user_id: string;
  role: string;
  user: { email?: string; username?: string };
}

export function MemberList({ communityId, isAdmin }: { communityId: string; isAdmin: boolean }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await fetchCommunityMembers(communityId);
      setMembers(data as any);
      setLoading(false);
    }
    load();
  }, [communityId]);

  if (loading) return <p className="text-slate-500 dark:text-slate-400">Loading members…</p>;

  const handleRoleChange = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "member" : "admin";
    const res = await updateMemberRole(communityId, userId, newRole);
    if (res.success) {
      setMembers(members.map(m => m.user_id === userId ? { ...m, role: newRole } : m));
    } else {
      alert("Failed to update role");
    }
  };

  return (
    <div className="space-y-3">
      {members.map((m) => (
        <div key={m.user_id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400">
              {(m.user.username?.[0] || m.user.email?.[0] || "?").toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {m.user.username || m.user.email?.split("@")[0] || "Citizen"}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide">
                {m.role.toUpperCase()}
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRoleChange(m.user_id, m.role)}
              className="text-xs"
            >
              {m.role === "admin" ? "Revoke Admin" : "Make Admin"}
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
