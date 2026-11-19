"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LoadingState } from "@/components/ui/LoadingState";
import { ShieldCheck, Lock, CheckCircle2 } from "lucide-react";

export default function RolesPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await api.listRoles();
      setRoles(data);
      setLoading(false);
    }
    load();
  }, []);

  if (loading)
    return (
      <LoadingState message="Loading RBAC roles and permissions matrix..." />
    );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Roles and Permissions (RBAC)
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Backend-enforced permission matrix governing applications, repository
          sync, release approvals, and catalogue publishing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((r) => (
          <Card key={r.id} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-henu-50 text-henu-600 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{r.name}</h3>
                <span className="text-xs text-slate-400">System Role</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {r.description}
            </p>

            <div className="pt-3 border-t border-slate-100">
              <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider block mb-2">
                Assigned Permissions
              </span>
              <div className="flex flex-wrap gap-1.5">
                {r.permissions.map((p: string) => (
                  <span
                    key={p}
                    className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
