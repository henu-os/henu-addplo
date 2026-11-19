"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { CatalogueRevision } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Alert } from "@/components/ui/Alert";
import { History, RotateCcw } from "lucide-react";

export default function CatalogueRevisionsPage() {
  const [revisions, setRevisions] = useState<CatalogueRevision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.listCatalogueRevisions();
        setRevisions(data);
      } catch (err: any) {
        setError(err.message || "Failed to load catalogue revisions.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading)
    return <LoadingState message="Loading immutable revision history..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Catalogue Revision History
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Immutable archive of all published catalogue revisions and
            cryptographic content hashes.
          </p>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}

      {revisions.length === 0 ? (
        <EmptyState
          icon={<History className="w-8 h-8 text-slate-400" />}
          title="No Revision History"
          description="Revisions will appear here once the first catalogue manifest is published."
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[11px] font-semibold tracking-wider">
                <tr>
                  <th className="py-3 px-6">Revision #</th>
                  <th className="py-3 px-4">Summary</th>
                  <th className="py-3 px-4">Apps / Releases</th>
                  <th className="py-3 px-4">Content Hash</th>
                  <th className="py-3 px-4">Published At</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {revisions.map((rev) => (
                  <tr
                    key={rev.id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="py-4 px-6 font-mono font-bold text-slate-900">
                      #{rev.revisionNumber}
                      {rev.isActive && (
                        <span className="ml-2 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 font-medium text-slate-800">
                      {rev.summary}
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-600">
                      {rev.applicationCount} apps • {rev.releaseCount} releases
                    </td>
                    <td className="py-4 px-4 font-mono text-[11px] text-slate-500">
                      <span
                        className="truncate max-w-[120px] block"
                        title={rev.contentHash}
                      >
                        {rev.contentHash.slice(0, 16)}...
                      </span>
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-500">
                      {new Date(rev.publishedAt).toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {!rev.isActive && (
                        <a
                          href={`/catalogue/rollback?revision=${rev.revisionNumber}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
                        >
                          <RotateCcw className="w-3 h-3" /> Rollback
                        </a>
                      )}
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
