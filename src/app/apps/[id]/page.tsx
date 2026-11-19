"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Application, Release } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Badge, getStatusBadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/LoadingState";
import { Alert } from "@/components/ui/Alert";
import { Modal } from "@/components/ui/Modal";
import {
  ArrowLeft,
  Boxes,
  GitBranch,
  Layers,
  Cpu,
  RefreshCw,
  Archive,
  Trash2,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [app, setApp] = useState<Application | null>(null);
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modal confirm state
  const [modalAction, setModalAction] = useState<"archive" | "delete" | null>(
    null,
  );
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = async () => {
    try {
      const [appData, relRes] = await Promise.all([
        api.getApplication(id),
        api.listReleases({ applicationId: id, limit: 10 }),
      ]);
      setApp(appData);
      setReleases(relRes.data);
    } catch (err: any) {
      setError(err.message || "Failed to load application details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleSyncRepository = async (repoId: string) => {
    setSyncing(true);
    setError(null);
    try {
      const res = await api.syncRepository(repoId);
      setSuccess(res.message || "Repository sync triggered successfully.");
      await loadData();
    } catch (err: any) {
      setError(err.message || "Repository sync failed.");
    } finally {
      setSyncing(false);
    }
  };

  const handleModalConfirm = async () => {
    if (!modalAction) return;
    setActionLoading(true);
    try {
      if (modalAction === "archive") {
        await api.archiveApplication(id);
        setSuccess("Application archived successfully.");
        await loadData();
      } else {
        await api.deleteApplication(id);
        router.push("/apps");
      }
      setModalAction(null);
    } catch (err: any) {
      setError(err.message || `Failed to ${modalAction} application.`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingState message="Loading application profile..." />;
  if (error && !app) return <Alert type="error" message={error} />;
  if (!app) return <Alert type="error" message="Application not found." />;

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div>
        <a
          href="/apps"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Applications
        </a>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            {app.iconUrl ? (
              <img
                src={app.iconUrl}
                alt=""
                className="w-14 h-14 rounded-2xl border border-slate-200 object-cover bg-white shadow-2xs"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-henu-50 border border-henu-200 flex items-center justify-center text-henu-700 font-bold text-xl">
                {app.displayName[0]}
              </div>
            )}
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900">
                  {app.displayName}
                </h1>
                <Badge variant={getStatusBadgeVariant(app.status)}>
                  {app.status}
                </Badge>
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {app.appType}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                ID: {app.slug} • Category: {app.category} • Min HUB: v
                {app.minHubVersion}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {app.status !== "ARCHIVED" && (
              <Button
                variant="outline"
                size="sm"
                icon={<Archive className="w-3.5 h-3.5" />}
                onClick={() => setModalAction("archive")}
              >
                Archive
              </Button>
            )}
            <Button
              variant="danger"
              size="sm"
              icon={<Trash2 className="w-3.5 h-3.5" />}
              onClick={() => setModalAction("delete")}
            >
              Delete
            </Button>
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

      {/* Grid: Details & Repositories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Metadata & Platform Compat */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Application Summary & Overview">
            <p className="text-sm text-slate-700 leading-relaxed font-medium mb-4">
              {app.summary}
            </p>
            <div className="prose prose-sm max-w-none text-slate-600 bg-slate-50/70 p-4 rounded-xl border border-slate-100">
              <pre className="text-xs whitespace-pre-wrap font-sans">
                {app.description}
              </pre>
            </div>

            {app.webAppUrl && (
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500">
                  Target Web App URL:
                </span>
                <a
                  href={app.webAppUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-henu-600 hover:underline flex items-center gap-1 font-mono"
                >
                  {app.webAppUrl} <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </Card>

          {/* Platform Compatibility Matrix */}
          <Card
            title="Platform Compatibility Profiles"
            subtitle="Configured OS, CPU architecture, and packaging formats for this application"
          >
            {!app.compatibilities || app.compatibilities.length === 0 ? (
              <p className="text-xs text-slate-400 py-3">
                No compatibility profiles registered.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">OS</th>
                      <th className="py-2.5 px-3">Architecture</th>
                      <th className="py-2.5 px-3">Format</th>
                      <th className="py-2.5 px-3">Min OS Version</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {app.compatibilities.map((c) => (
                      <tr key={c.id}>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">
                          {c.os}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-600">
                          {c.arch}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                            {c.packageFormat}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-500">
                          {c.minOsVersion || "Any"}
                        </td>
                        <td className="py-2.5 px-3">
                          <Badge variant={c.isSupported ? "success" : "danger"}>
                            {c.isSupported ? "Supported" : "Disabled"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Connected Repositories & Recent Releases */}
        <div className="space-y-6">
          {/* Connected GitHub Repositories */}
          <Card title="Upstream GitHub Repository">
            {!app.connections || app.connections.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">
                No GitHub repository connected.
              </p>
            ) : (
              <div className="space-y-4">
                {app.connections.map((conn) => (
                  <div
                    key={conn.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GitBranch className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-bold text-slate-900">
                          {conn.repoOwner}/{conn.repoName}
                        </span>
                      </div>
                      <Badge variant={conn.isActive ? "success" : "neutral"}>
                        {conn.isActive ? "Active" : "Paused"}
                      </Badge>
                    </div>

                    <div className="text-xs text-slate-500 space-y-1">
                      <div>
                        Installation ID:{" "}
                        <span className="font-mono text-slate-700">
                          {conn.githubInstallationId}
                        </span>
                      </div>
                      <div>
                        Target Branch:{" "}
                        <span className="font-mono text-slate-700">
                          {conn.targetBranch}
                        </span>
                      </div>
                      <div className="truncate">
                        Pattern:{" "}
                        <span className="font-mono text-slate-700">
                          {conn.assetPattern}
                        </span>
                      </div>
                      {conn.lastSyncAt && (
                        <div>
                          Last Sync:{" "}
                          {new Date(conn.lastSyncAt).toLocaleString()}
                        </div>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      loading={syncing}
                      icon={<RefreshCw className="w-3 h-3" />}
                      className="w-full text-xs"
                      onClick={() => handleSyncRepository(conn.id)}
                    >
                      Verify & Sync Access
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Releases for this App */}
          <Card title="Ingested Releases">
            {releases.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">
                No release events ingested yet.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {releases.map((rel) => (
                  <div
                    key={rel.id}
                    className="py-2.5 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-900">
                        v{rel.version}
                      </span>
                      <span className="text-slate-400 ml-2">
                        ({rel.channel?.name || "STABLE"})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusBadgeVariant(rel.status)}>
                        {rel.status}
                      </Badge>
                      <a
                        href={`/releases/${rel.id}`}
                        className="text-henu-600 hover:underline"
                      >
                        View
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={!!modalAction}
        title={
          modalAction === "archive"
            ? "Archive Application"
            : "Delete Application"
        }
        message={`Are you sure you want to ${modalAction} "${app.displayName}"?`}
        confirmLabel={modalAction === "archive" ? "Archive" : "Delete"}
        variant={modalAction === "delete" ? "danger" : "primary"}
        loading={actionLoading}
        onConfirm={handleModalConfirm}
        onCancel={() => setModalAction(null)}
      />
    </div>
  );
}
