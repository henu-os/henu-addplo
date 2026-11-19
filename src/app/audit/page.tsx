"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { AuditLog } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Alert } from "@/components/ui/Alert";
import { FileText, Eye, Code2 } from "lucide-react";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPayload, setSelectedPayload] = useState<{
    id: string;
    payload: any;
  } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.listAuditLogs({ limit: 50 });
        setLogs(res.data);
      } catch (err: any) {
        setError(err.message || "Failed to retrieve audit trail.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading)
    return (
      <LoadingState message="Loading immutable audit trail from Platform API..." />
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Audit Trail
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Immutable, append-only security log recording every administrative
            mutation, release approval, and login.
          </p>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}

      {logs.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-8 h-8 text-slate-400" />}
          title="No Audit Records"
          description="Administrative activities will be logged here in append-only records."
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[11px] font-semibold tracking-wider">
                <tr>
                  <th className="py-3 px-6">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Target Entity</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-6 text-right">Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-xs">
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="py-3.5 px-6 text-slate-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {log.action}
                    </td>
                    <td className="py-3.5 px-4 font-sans text-slate-700">
                      {log.actorEmail}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {log.entityType}{" "}
                      {log.entityId ? `(${log.entityId.slice(0, 8)})` : ""}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {log.ipAddress}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      {log.payload ? (
                        <button
                          onClick={() =>
                            setSelectedPayload({
                              id: log.id,
                              payload: log.payload,
                            })
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-sans text-xs"
                        >
                          <Eye className="w-3 h-3" /> View
                        </button>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Payload Modal */}
      {selectedPayload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-henu-600" /> Audit Event Payload
              </h3>
              <button
                onClick={() => setSelectedPayload(null)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Close
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono max-h-96 overflow-y-auto">
              {JSON.stringify(selectedPayload.payload, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
