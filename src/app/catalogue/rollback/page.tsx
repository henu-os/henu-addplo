"use client";

import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Modal } from "@/components/ui/Modal";
import { RotateCcw, AlertTriangle } from "lucide-react";

export default function RollbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialRevision = searchParams.get("revision") || "1";

  const [revisionNumber, setRevisionNumber] = useState(initialRevision);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleRollback = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    setShowConfirm(false);

    try {
      const res = await api.rollbackCatalogue(Number(revisionNumber));
      setSuccess(
        `Catalogue successfully rolled back to Revision #${res.revision || revisionNumber}! CDN edge cache has been invalidated.`,
      );
    } catch (err: any) {
      setError(err.message || "Rollback failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Catalogue Rollback
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Safely revert the active public catalogue pointer to any previous
          verified immutable revision.
        </p>
      </div>

      {error && (
        <Alert type="error" message={error} onClose={() => setError(null)} />
      )}
      {success && <Alert type="success" message={success} />}

      <Card>
        <div className="space-y-5">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold">
                Zero-Downtime Atomic Rollback
              </span>
              <p className="text-slate-600 leading-relaxed">
                Rolling back switches the live catalogue pointer to the target
                historical snapshot. No existing revision snapshots are deleted
                or altered.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target Revision Sequence Number{" "}
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min={1}
              required
              value={revisionNumber}
              onChange={(e) => setRevisionNumber(e.target.value)}
              placeholder="e.g. 1"
              className="w-full text-sm font-mono rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-henu-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <a
              href="/catalogue/revisions"
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              Browse Revision History
            </a>
            <Button
              type="button"
              variant="danger"
              size="md"
              loading={loading}
              disabled={!revisionNumber}
              icon={<RotateCcw className="w-4 h-4" />}
              onClick={() => setShowConfirm(true)}
            >
              Rollback to Revision #{revisionNumber}
            </Button>
          </div>
        </div>
      </Card>

      <Modal
        isOpen={showConfirm}
        title="Confirm Catalogue Rollback"
        message={`Are you sure you want to revert the public catalogue to Revision #${revisionNumber}? HENU HUB Desktop clients will receive this revision upon their next poll.`}
        confirmLabel={`Rollback to #${revisionNumber}`}
        variant="danger"
        loading={loading}
        onConfirm={handleRollback}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}
