"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { AdminUser } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LoadingState } from "@/components/ui/LoadingState";
import { Alert } from "@/components/ui/Alert";
import { Users, Shield, KeyRound, Info } from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.listUsers();
        setUsers(data);
      } catch (err: any) {
        setError(err.message || "Failed to load administrator accounts.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading)
    return <LoadingState message="Loading administrative accounts..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Admin Users
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Authorized administrative users, role assignments, and multi-factor
            authentication status.
          </p>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-henu-50/70 border border-henu-200 text-xs text-henu-900 flex items-start gap-3">
        <Info className="w-4 h-4 text-henu-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">
            Secure Operator Provisioning Policy:
          </span>
          <p className="text-slate-600 mt-0.5 leading-relaxed">
            Public admin self-registration is permanently disabled for security.
            New administrative accounts can only be provisioned using the
            initial-admin seed script on the Platform API server:
            <code className="ml-1 px-1.5 py-0.5 rounded bg-white border border-henu-200 font-mono text-[11px] text-henu-800">
              npm run seed:admin
            </code>
          </p>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[11px] font-semibold tracking-wider">
              <tr>
                <th className="py-3 px-6">Administrator</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">MFA Status</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-6 text-right">Last Login</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="hover:bg-slate-50/70 transition-colors"
                >
                  <td className="py-4 px-6 font-semibold text-slate-900 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-henu-100 text-henu-700 flex items-center justify-center font-bold text-xs">
                      {u.fullName ? u.fullName[0].toUpperCase() : "A"}
                    </div>
                    <span>{u.fullName || "Admin User"}</span>
                  </td>
                  <td className="py-4 px-4 font-mono text-xs text-slate-600">
                    {u.email}
                  </td>
                  <td className="py-4 px-4">
                    <Badge variant="brand">
                      {u.role?.name || "ADMINISTRATOR"}
                    </Badge>
                  </td>
                  <td className="py-4 px-4">
                    <Badge variant={u.mfaEnabled ? "success" : "warning"}>
                      {u.mfaEnabled ? "MFA Active" : "MFA Disabled"}
                    </Badge>
                  </td>
                  <td className="py-4 px-4">
                    <Badge variant={u.isActive ? "success" : "danger"}>
                      {u.isActive ? "Active" : "Locked"}
                    </Badge>
                  </td>
                  <td className="py-4 px-6 text-right text-xs text-slate-500">
                    {u.lastLoginAt
                      ? new Date(u.lastLoginAt).toLocaleString()
                      : "Never"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
