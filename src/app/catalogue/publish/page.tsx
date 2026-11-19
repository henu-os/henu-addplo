"use client";

import React, { useState } from "react";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Sparkles, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function CataloguePublishPage() {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary.trim()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await api.publishCatalogueRevision(summary.trim());
      setSuccess(
        `Successfully published Catalogue Revision #${res.revisionNumber || "N"}! Content Hash: ${res.contentHash || "verified"}`,
      );
      setSummary("");
    } catch (err: any) {
      setError(err.message || "Failed to publish catalogue revision.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Publish Catalogue Revision
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Compile active validated applications and verified release packages
          into an immutable catalogue revision snapshot.
        </p>
      </div>

      {error && (
        <Alert type="error" message={error} onClose={() => setError(null)} />
      )}
      {success && <Alert type="success" message={success} />}

      <Card>
        <form onSubmit={handlePublish} className="space-y-5">
          <div className="p-4 rounded-xl bg-henu-50/70 border border-henu-200 text-henu-900 text-xs space-y-2">
            <div className="flex items-center gap-2 font-semibold">
              <ShieldCheck className="w-4 h-4 text-henu-600" />
              <span>Pre-flight Publication Verification Rules</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>Only applications with status ACTIVE are included.</li>
              <li>
                Only releases in APPROVED or PUBLISHED state are distributed.
              </li>
              <li>
                Every package must contain verified SHA-256 and HTTPS download
                URLs.
              </li>
              <li>An immutable revision snapshot is permanently recorded.</li>
            </ul>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Revision Summary / Release Note{" "}
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="e.g. Published HENU PA v1.0.0 and updated IDE compatibility"
              className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-henu-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              disabled={!summary.trim()}
              icon={<Sparkles className="w-4 h-4" />}
            >
              Sign & Publish Revision
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
