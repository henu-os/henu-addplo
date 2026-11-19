"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Release } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Badge, getStatusBadgeVariant } from "@/components/ui/Badge";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Alert } from "@/components/ui/Alert";
import { Layers, ArrowUpRight, Filter } from "lucide-react";

export default function ReleasesPage() {
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");

  const fetchReleases = async () => {
    setLoading(true);
    try {
      const res = await api.listReleases({
        status: statusFilter || undefined,
        limit: 50,
      });
      setReleases(res.data);
    } catch (err: any) {
      setError(err.message || "Failed to load releases.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReleases();
  }, [statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Releases Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review, approve, promote, and inspect ingested releases and verified
            binary assets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm rounded-lg border border-slate-300 px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-henu-500"
          >
            <option value="">All Statuses</option>
            <option value="VALIDATED">Pending Approval (VALIDATED)</option>
            <option value="APPROVED">Approved</option>
            <option value="PUBLISHED">Published</option>
            <option value="REJECTED">Rejected</option>
            <option value="REVOKED">Revoked</option>
          </select>
        </div>
      </div>

      {error && (
        <Alert type="error" message={error} onClose={() => setError(null)} />
      )}

      {loading ? (
        <LoadingState message="Loading releases pipeline..." />
      ) : releases.length === 0 ? (
        <EmptyState
          icon={<Layers className="w-8 h-8 text-slate-400" />}
          title="No Releases Found"
          description={
            statusFilter
              ? `No releases with status ${statusFilter}.`
              : "Publish a release on a connected GitHub repository to start ingestion."
          }
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[11px] font-semibold tracking-wider">
                <tr>
                  <th className="py-3 px-6">Application</th>
                  <th className="py-3 px-4">Version / Tag</th>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assets</th>
                  <th className="py-3 px-4">Published Date</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {releases.map((rel) => (
                  <tr
                    key={rel.id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="py-4 px-6 font-semibold text-slate-900">
                      {rel.application?.displayName ||
                        rel.application?.slug ||
                        "Unknown"}
                    </td>
                    <td className="py-4 px-4 font-mono text-xs">
                      <span className="font-semibold text-slate-800">
                        v{rel.version}
                      </span>
                      <span className="text-slate-400 block text-[11px]">
                        Tag: {rel.tagName}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {rel.channel?.name || "STABLE"}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant={getStatusBadgeVariant(rel.status)}>
                        {rel.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 font-mono text-xs text-slate-600">
                      {rel.assets?.length || 0} packages
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-500">
                      {rel.publishedAt
                        ? new Date(rel.publishedAt).toLocaleDateString()
                        : "Unpublished"}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <a
                        href={`/releases/${rel.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-henu-700 bg-henu-50 hover:bg-henu-100 rounded-lg transition-colors"
                      >
                        Details <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
