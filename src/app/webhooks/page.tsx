"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { WebhookEvent } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Badge, getStatusBadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Alert } from "@/components/ui/Alert";
import { Webhook, RefreshCw, Eye, Code2 } from "lucide-react";

export default function WebhooksPage() {
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [replayingId, setReplayingId] = useState<string | null>(null);
  const [inspectPayload, setInspectPayload] = useState<any | null>(null);

  const loadEvents = async () => {
    try {
      const res = await api.listWebhooks({ limit: 50 });
      setEvents(res.data);
    } catch (err: any) {
      setError(err.message || "Failed to load webhook delivery history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleReplay = async (id: string) => {
    setReplayingId(id);
    setError(null);
    setSuccess(null);
    try {
      await api.replayWebhook(id);
      setSuccess(
        `Webhook delivery ${id.slice(0, 8)} successfully replayed through release pipeline!`,
      );
      await loadEvents();
    } catch (err: any) {
      setError(err.message || "Replay failed.");
    } finally {
      setReplayingId(null);
    }
  };

  if (loading)
    return (
      <LoadingState message="Loading GitHub webhook delivery history..." />
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            GitHub Webhook Events
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Ingress delivery history, HMAC signature verification records, and
            failed-event replay.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={<RefreshCw className="w-3.5 h-3.5" />}
          onClick={loadEvents}
        >
          Refresh
        </Button>
      </div>

      {error && (
        <Alert type="error" message={error} onClose={() => setError(null)} />
      )}
      {success && (
        <Alert
          type="success"
          message={success}
          onClose={() => setSuccess(null)}
        />
      )}

      {events.length === 0 ? (
        <EmptyState
          icon={<Webhook className="w-8 h-8 text-slate-400" />}
          title="No Webhook Events Received"
          description="Webhook release and ping events from connected GitHub repositories will appear here."
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[11px] font-semibold tracking-wider">
                <tr>
                  <th className="py-3 px-6">Delivery ID</th>
                  <th className="py-3 px-4">Event Type</th>
                  <th className="py-3 px-4">Repository</th>
                  <th className="py-3 px-4">Attempts</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Received At</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-xs">
                {events.map((wh) => (
                  <tr
                    key={wh.id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="py-4 px-6 font-semibold text-slate-900">
                      <span
                        className="truncate max-w-[140px] block"
                        title={wh.deliveryId}
                      >
                        {wh.deliveryId}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-sans font-medium text-slate-800">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-mono">
                        {wh.eventType}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-sans text-xs text-slate-600">
                      {wh.repositoryConnection
                        ? `${wh.repositoryConnection.repoOwner}/${wh.repositoryConnection.repoName}`
                        : "—"}
                    </td>
                    <td className="py-4 px-4 text-slate-500">
                      #{wh.attemptCount}
                    </td>
                    <td className="py-4 px-4 font-sans">
                      <Badge variant={getStatusBadgeVariant(wh.status)}>
                        {wh.status}
                      </Badge>
                      {wh.lastError && (
                        <span
                          className="block text-[11px] text-rose-600 font-mono truncate max-w-xs mt-0.5"
                          title={wh.lastError}
                        >
                          {wh.lastError}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-slate-500">
                      {new Date(wh.createdAt).toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-right font-sans">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setInspectPayload(wh.payload)}
                          className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                          title="Inspect raw payload"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <Button
                          variant="outline"
                          size="sm"
                          loading={replayingId === wh.id}
                          icon={<RefreshCw className="w-3 h-3" />}
                          onClick={() => handleReplay(wh.id)}
                        >
                          Replay
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Payload Modal */}
      {inspectPayload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-henu-600" /> Webhook Payload
                Delivery Inspection
              </h3>
              <button
                onClick={() => setInspectPayload(null)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Close
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono max-h-96 overflow-y-auto">
              {JSON.stringify(inspectPayload, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
