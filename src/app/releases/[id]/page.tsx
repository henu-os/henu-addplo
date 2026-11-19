"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { Release, ReleaseStatus } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Badge, getStatusBadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/LoadingState";
import { Alert } from "@/components/ui/Alert";
import { Modal } from "@/components/ui/Modal";
import {
  ArrowLeft,
  CheckCircle,
  TrendingUp,
  AlertOctagon,
  FileCode,
  Download,
  ShieldCheck,
  ShieldX,
} from "lucide-react";

export default function ReleaseDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [release, setRelease] = useState<Release | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modals for approve, promote, revoke
  const [activeModal, setActiveModal] = useState<
    "approve" | "promote" | "revoke" | null
  >(null);
  const [promoteChannel, setPromoteChannel] = useState("STABLE");
  const [revokeReason, setRevokeReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const loadRelease = async () => {
    try {
      const data = await api.getRelease(id);
      setRelease(data);
    } catch (err: any) {
      setError(err.message || "Failed to load release details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRelease();
  }, [id]);

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await api.approveRelease(id);
      setSuccess("Release approved successfully.");
      setActiveModal(null);
      await loadRelease();
    } catch (err: any) {
      setError(err.message || "Approval failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePromote = async () => {
    setActionLoading(true);
    try {
      await api.promoteRelease(id, promoteChannel);
      setSuccess(`Release promoted to ${promoteChannel} and published!`);
      setActiveModal(null);
      await loadRelease();
    } catch (err: any) {
      setError(err.message || "Promotion failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevoke = async () => {
    if (!revokeReason.trim()) return;
    setActionLoading(true);
    try {
      await api.revokeRelease(id, revokeReason.trim());
      setSuccess("Release revoked from distribution.");
      setActiveModal(null);
      await loadRelease();
    } catch (err: any) {
      setError(err.message || "Revocation failed.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading)
    return (
      <LoadingState message="Loading release metadata and verified assets..." />
    );
  if (error && !release) return <Alert type="error" message={error} />;
  if (!release) return <Alert type="error" message="Release not found." />;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <a
          href="/releases"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Releases
        </a>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">
                {release.application?.displayName || release.application?.slug}{" "}
                v{release.version}
              </h1>
              <Badge variant={getStatusBadgeVariant(release.status)}>
                {release.status}
              </Badge>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                {release.channel?.name || "STABLE"}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Tag: {release.tagName} • Commit:{" "}
              {release.gitCommitSha.slice(0, 8)} • Ingested:{" "}
              {new Date(release.createdAt).toLocaleString()}
            </p>
          </div>

          {/* Action Gatekeeper Controls */}
          <div className="flex items-center gap-2">
            {release.status === "VALIDATED" && (
              <Button
                variant="primary"
                size="sm"
                icon={<CheckCircle className="w-4 h-4" />}
                onClick={() => setActiveModal("approve")}
              >
                Approve Release
              </Button>
            )}

            {(release.status === "VALIDATED" ||
              release.status === "APPROVED") && (
              <Button
                variant="secondary"
                size="sm"
                icon={<TrendingUp className="w-4 h-4" />}
                onClick={() => setActiveModal("promote")}
              >
                Promote Channel
              </Button>
            )}

            {release.status !== "REVOKED" && release.status !== "REJECTED" && (
              <Button
                variant="danger"
                size="sm"
                icon={<AlertOctagon className="w-4 h-4" />}
                onClick={() => setActiveModal("revoke")}
              >
                Revoke
              </Button>
            )}
          </div>
        </div>
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

      {/* Rejection / Revocation Reason Callout */}
      {release.status === "REJECTED" && release.rejectionReason && (
        <Alert
          type="error"
          title="Release Validation Failure"
          message={release.rejectionReason}
        />
      )}

      {release.status === "REVOKED" && release.revocationReason && (
        <Alert
          type="warning"
          title="Administrative Revocation Notice"
          message={release.revocationReason}
        />
      )}

      {/* Grid: Assets & Changelog */}
      <div className="space-y-6">
        {/* Verified Binary Assets */}
        <Card
          title="Binary Release Assets"
          subtitle="Cryptographically verified packages matched with target platform profiles"
        >
          {!release.assets || release.assets.length === 0 ? (
            <p className="text-xs text-slate-400 py-3">
              No assets attached to this release.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">File Name</th>
                    <th className="py-2.5 px-3">Size</th>
                    <th className="py-2.5 px-3">SHA-256 Digest</th>
                    <th className="py-2.5 px-3">Installable</th>
                    <th className="py-2.5 px-3">Verification</th>
                    <th className="py-2.5 px-3 text-right">Download</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {release.assets.map((asset) => (
                    <tr key={asset.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          <FileCode className="w-3.5 h-3.5 text-slate-400" />
                          {asset.fileName}
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {asset.contentType}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600">
                        {(asset.sizeBytes / 1024 / 1024).toFixed(2)} MB
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className="font-mono text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded max-w-xs truncate block"
                          title={asset.sha256}
                        >
                          {asset.sha256}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <Badge
                          variant={asset.isInstallable ? "success" : "neutral"}
                        >
                          {asset.isInstallable ? "Yes" : "Companion"}
                        </Badge>
                      </td>
                      <td className="py-3 px-3">
                        <Badge
                          variant={
                            asset.verificationStatus === "VERIFIED"
                              ? "success"
                              : "danger"
                          }
                        >
                          {asset.verificationStatus}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <a
                          href={asset.downloadUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200"
                        >
                          <Download className="w-3 h-3" /> Get
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Release Notes */}
        <Card title="Release Notes & Changelog">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <pre className="text-xs text-slate-700 whitespace-pre-wrap font-sans">
              {release.changelog || "No release notes provided."}
            </pre>
          </div>
        </Card>
      </div>

      {/* Approve Modal */}
      <Modal
        isOpen={activeModal === "approve"}
        title="Approve Release for Distribution"
        message={`Are you sure you want to approve v${release.version}? This validates the release for catalogue inclusion.`}
        confirmLabel="Approve Release"
        variant="primary"
        loading={actionLoading}
        onConfirm={handleApprove}
        onCancel={() => setActiveModal(null)}
      />

      {/* Promote Modal */}
      {activeModal === "promote" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              Promote Release Channel
            </h3>
            <p className="text-xs text-slate-600">
              Promoting this release will update its distribution channel and
              publish it immediately.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Channel
              </label>
              <select
                value={promoteChannel}
                onChange={(e) => setPromoteChannel(e.target.value)}
                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white"
              >
                <option value="STABLE">STABLE (Production Public)</option>
                <option value="BETA">BETA (Preview)</option>
                <option value="NIGHTLY">NIGHTLY</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                variant="outline"
                size="md"
                onClick={() => setActiveModal(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                loading={actionLoading}
                onClick={handlePromote}
              >
                Promote & Publish
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Revoke Modal */}
      {activeModal === "revoke" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-lg font-bold text-rose-600">
              Revoke Release from Distribution
            </h3>
            <p className="text-xs text-slate-600">
              Revoking marks this release as recalled. HENU HUB clients will
              immediately stop offering this version for download.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason for Revocation <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                placeholder="e.g. Discovered severe zero-day CVE-2026-XXXX or critical regression."
                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                variant="outline"
                size="md"
                onClick={() => setActiveModal(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="md"
                loading={actionLoading}
                disabled={!revokeReason.trim()}
                onClick={handleRevoke}
              >
                Revoke Release
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
