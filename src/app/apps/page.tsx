"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Application, ApplicationStatus } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Badge, getStatusBadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Alert } from "@/components/ui/Alert";
import { Modal } from "@/components/ui/Modal";
import {
  Boxes,
  Plus,
  Search,
  Archive,
  Trash2,
  ExternalLink,
} from "lucide-react";

export default function ApplicationsPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Confirmation modal state
  const [targetApp, setTargetApp] = useState<{
    id: string;
    name: string;
    action: "archive" | "delete";
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchApps = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.listApplications({
        search,
        status: statusFilter || undefined,
      });
      setApps(res.data);
    } catch (err: any) {
      setError(err.message || "Failed to retrieve applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchApps();
  };

  const handleConfirmAction = async () => {
    if (!targetApp) return;
    setActionLoading(true);
    try {
      if (targetApp.action === "archive") {
        await api.archiveApplication(targetApp.id);
      } else {
        await api.deleteApplication(targetApp.id);
      }
      setTargetApp(null);
      await fetchApps();
    } catch (err: any) {
      setError(err.message || `Failed to ${targetApp.action} application.`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Applications
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Register and manage software ecosystem applications and their
            platform matrices.
          </p>
        </div>
        <a
          href="/apps/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-henu-600 text-white rounded-lg text-sm font-medium hover:bg-henu-700 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Application
        </a>
      </div>

      {error && (
        <Alert type="error" message={error} onClose={() => setError(null)} />
      )}

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, slug or category..."
            className="w-full pl-9 pr-4 py-1.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-henu-500"
          />
        </form>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm rounded-lg border border-slate-300 px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-henu-500"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="DRAFT">Draft</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="DEPRECATED">Deprecated</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      {/* Applications Table / Cards */}
      {loading ? (
        <LoadingState message="Loading applications list..." />
      ) : apps.length === 0 ? (
        <EmptyState
          icon={<Boxes className="w-8 h-8 text-slate-400" />}
          title="No applications found"
          description={
            search
              ? "No applications match your search query."
              : "Get started by registering your first application in the HENU ecosystem."
          }
          action={
            <a
              href="/apps/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-henu-600 text-white rounded-lg text-sm font-medium hover:bg-henu-700"
            >
              <Plus className="w-4 h-4" /> Register Application
            </a>
          }
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[11px] font-semibold tracking-wider">
                <tr>
                  <th className="py-3 px-6">Application</th>
                  <th className="py-3 px-4">Slug ID</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Min HUB</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {apps.map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {app.iconUrl ? (
                          <img
                            src={app.iconUrl}
                            alt=""
                            className="w-9 h-9 rounded-lg border border-slate-200 object-cover bg-white"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-henu-50 border border-henu-200 flex items-center justify-center text-henu-700 font-bold text-xs">
                            {app.displayName[0]}
                          </div>
                        )}
                        <div>
                          <a
                            href={`/apps/${app.id}`}
                            className="font-semibold text-slate-900 hover:text-henu-600 hover:underline"
                          >
                            {app.displayName}
                          </a>
                          <p className="text-xs text-slate-400 line-clamp-1 max-w-xs">
                            {app.summary}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-mono text-xs text-slate-600">
                      {app.slug}
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {app.appType}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-600">
                      {app.category}
                    </td>
                    <td className="py-4 px-4 font-mono text-xs text-slate-500">
                      v{app.minHubVersion}
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant={getStatusBadgeVariant(app.status)}>
                        {app.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/apps/${app.id}`}
                          className="px-2.5 py-1 text-xs font-medium rounded-md bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                        >
                          Details
                        </a>
                        {app.status !== "ARCHIVED" && (
                          <button
                            onClick={() =>
                              setTargetApp({
                                id: app.id,
                                name: app.displayName,
                                action: "archive",
                              })
                            }
                            title="Archive Application"
                            className="p-1 rounded-md text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() =>
                            setTargetApp({
                              id: app.id,
                              name: app.displayName,
                              action: "delete",
                            })
                          }
                          title="Delete Application"
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

      {/* Confirmation Modal */}
      <Modal
        isOpen={!!targetApp}
        title={
          targetApp?.action === "archive"
            ? "Archive Application"
            : "Delete Application"
        }
        message={`Are you sure you want to ${targetApp?.action} "${targetApp?.name}"? ${
          targetApp?.action === "delete"
            ? "This operation is permanent and will delete all associated platform compatibility entries."
            : "The application will be hidden from the public catalogue until restored."
        }`}
        confirmLabel={targetApp?.action === "archive" ? "Archive" : "Delete"}
        variant={targetApp?.action === "delete" ? "danger" : "primary"}
        loading={actionLoading}
        onConfirm={handleConfirmAction}
        onCancel={() => setTargetApp(null)}
      />
    </div>
  );
}
