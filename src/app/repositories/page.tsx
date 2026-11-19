"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { RepositoryConnection, Application } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Alert } from "@/components/ui/Alert";
import { Modal } from "@/components/ui/Modal";
import { GitBranch, RefreshCw, Plus, Trash2, ExternalLink } from "lucide-react";

export default function RepositoriesPage() {
  const [repos, setRepos] = useState<RepositoryConnection[]>([]);
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  // New Repo Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAppId, setNewAppId] = useState("");
  const [newOwner, setNewOwner] = useState("henu-os");
  const [newName, setNewName] = useState("");
  const [newInstId, setNewInstId] = useState("123456");
  const [newPattern, setNewPattern] = useState(
    "^henu-(.+)-(windows|macos|linux)-(x64|arm64|universal)\\.(exe|msi|dmg|pkg|deb|rpm|appimage)$",
  );
  const [createLoading, setCreateLoading] = useState(false);

  // Delete Confirm
  const [deleteTarget, setDeleteTarget] = useState<RepositoryConnection | null>(
    null,
  );
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadData = async () => {
    try {
      const [repoRes, appRes] = await Promise.all([
        api.listRepositories({ limit: 100 }),
        api.listApplications({ limit: 100 }),
      ]);
      setRepos(repoRes.data);
      setApps(appRes.data);
      if (appRes.data.length > 0 && !newAppId) {
        setNewAppId(appRes.data[0].id);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load connected repositories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSync = async (id: string) => {
    setSyncingId(id);
    setError(null);
    try {
      const res = await api.syncRepository(id);
      setSuccess(
        res.message || "Repository connection verified with GitHub API.",
      );
      await loadData();
    } catch (err: any) {
      setError(err.message || "Sync failed.");
    } finally {
      setSyncingId(null);
    }
  };

  const handleCreateRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setError(null);
    try {
      await api.createRepository({
        applicationId: newAppId,
        repoOwner: newOwner.trim().toLowerCase(),
        repoName: newName.trim().toLowerCase(),
        githubInstallationId: Number(newInstId),
        assetPattern: newPattern.trim(),
        autoIngestReleases: true,
        autoPublishChannels: ["BETA"],
        isActive: true,
      });
      setIsModalOpen(false);
      setSuccess("Repository connection created successfully.");
      await loadData();
    } catch (err: any) {
      setError(err.message || "Failed to create repository connection.");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await api.deleteRepository(deleteTarget.id);
      setDeleteTarget(null);
      setSuccess("Repository connection removed.");
      await loadData();
    } catch (err: any) {
      setError(err.message || "Failed to delete repository connection.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            GitHub Repositories
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Registered upstream GitHub App repository connections and release
            webhook matching rules.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          Connect Repository
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

      {loading ? (
        <LoadingState message="Loading repository connections..." />
      ) : repos.length === 0 ? (
        <EmptyState
          icon={<GitBranch className="w-8 h-8 text-slate-400" />}
          title="No GitHub Repositories Connected"
          description="Connect a GitHub repository to automatically ingest releases via webhooks."
          action={
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsModalOpen(true)}
            >
              Connect First Repository
            </Button>
          }
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[11px] font-semibold tracking-wider">
                <tr>
                  <th className="py-3 px-6">Repository</th>
                  <th className="py-3 px-4">Connected Application</th>
                  <th className="py-3 px-4">Installation ID</th>
                  <th className="py-3 px-4">Branch</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Last Sync</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {repos.map((repo) => (
                  <tr
                    key={repo.id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2.5">
                        <GitBranch className="w-4 h-4 text-purple-600 flex-shrink-0" />
                        <div>
                          <a
                            href={`https://github.com/${repo.repoOwner}/${repo.repoName}`}
                            target="_blank"
                            rel="noreferrer"
                            className="font-semibold text-slate-900 hover:text-henu-600 flex items-center gap-1"
                          >
                            {repo.repoOwner}/{repo.repoName}
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </a>
                          <span className="text-xs text-slate-400 font-mono line-clamp-1 max-w-xs">
                            {repo.assetPattern}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-medium text-slate-800">
                      {repo.application?.displayName || "—"}
                    </td>
                    <td className="py-4 px-4 font-mono text-xs text-slate-600">
                      {repo.githubInstallationId}
                    </td>
                    <td className="py-4 px-4 font-mono text-xs text-slate-600">
                      {repo.targetBranch}
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant={repo.isActive ? "success" : "neutral"}>
                        {repo.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-500">
                      {repo.lastSyncAt
                        ? new Date(repo.lastSyncAt).toLocaleString()
                        : "Never"}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          loading={syncingId === repo.id}
                          icon={<RefreshCw className="w-3 h-3" />}
                          onClick={() => handleSync(repo.id)}
                        >
                          Verify
                        </Button>
                        <button
                          onClick={() => setDeleteTarget(repo)}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Connect Repo Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              Connect GitHub Repository
            </h3>

            <form onSubmit={handleCreateRepo} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Application
                </label>
                <select
                  required
                  value={newAppId}
                  onChange={(e) => setNewAppId(e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white"
                >
                  {apps.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.displayName} ({a.slug})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Owner / Org
                  </label>
                  <input
                    type="text"
                    required
                    value={newOwner}
                    onChange={(e) => setNewOwner(e.target.value)}
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Repo Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. henu-pa"
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Installation ID
                </label>
                <input
                  type="number"
                  required
                  value={newInstId}
                  onChange={(e) => setNewInstId(e.target.value)}
                  className="w-full text-sm font-mono rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Asset Matching Regex
                </label>
                <input
                  type="text"
                  required
                  value={newPattern}
                  onChange={(e) => setNewPattern(e.target.value)}
                  className="w-full text-sm font-mono rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={createLoading}
                >
                  Connect & Verify
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteTarget}
        title="Disconnect Repository"
        message={`Are you sure you want to disconnect repository ${deleteTarget?.repoOwner}/${deleteTarget?.repoName}? Ingested releases will be retained.`}
        confirmLabel="Disconnect"
        variant="danger"
        loading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
