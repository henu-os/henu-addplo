"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { DashboardStats } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Badge, getStatusBadgeVariant } from "@/components/ui/Badge";
import { LoadingState } from "@/components/ui/LoadingState";
import { Alert } from "@/components/ui/Alert";
import {
  Boxes,
  GitBranch,
  Layers,
  AlertTriangle,
  History,
  ShieldAlert,
  ArrowUpRight,
  CheckCircle,
} from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await api.getDashboardOverview();
        setStats(data);
      } catch (err: any) {
        setError(
          err.message || "Failed to fetch dashboard metrics from Platform API.",
        );
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <LoadingState message="Loading dashboard statistics from Platform API..." />
    );
  }

  if (error || !stats) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          System Overview
        </h1>
        <Alert
          type="error"
          title="Could not connect to Platform API"
          message={error || "Unable to load ecosystem overview."}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Ecosystem Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time status of HENU applications, connected repositories,
            release pipelines, and public catalogue.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/apps/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-henu-600 text-white rounded-lg text-sm font-medium hover:bg-henu-700 shadow-sm transition-colors"
          >
            Register Application
          </a>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                Applications
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {stats.totalApps}
              </h3>
              <p className="text-xs text-emerald-600 font-medium mt-1">
                {stats.activeApps} Active in Catalog
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-henu-50 text-henu-600 flex items-center justify-center">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                GitHub Repos
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {stats.totalRepos}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Syncing Releases
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <GitBranch className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                Pending Approvals
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {stats.pendingApprovals.length}
              </h3>
              <p className="text-xs text-amber-600 font-medium mt-1">
                Require Admin Action
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                Failed Webhooks
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {stats.failedWebhooks.length}
              </h3>
              <p className="text-xs text-rose-600 font-medium mt-1">
                Can Be Replayed
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Grid: Pending Approvals & Latest Releases */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Release Approvals */}
        <Card
          title="Pending Approvals"
          subtitle="Validated releases waiting for release manager approval before STABLE distribution"
          action={
            <a
              href="/releases"
              className="text-xs font-semibold text-henu-600 hover:text-henu-700 flex items-center gap-1"
            >
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          }
        >
          {stats.pendingApprovals.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm flex flex-col items-center">
              <CheckCircle className="w-8 h-8 text-emerald-500 mb-2" />
              <span>
                All ingested releases have been reviewed and approved.
              </span>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {stats.pendingApprovals.map((rel) => (
                <div
                  key={rel.id}
                  className="py-3 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-900">
                        {rel.application?.displayName || rel.application?.slug}
                      </span>
                      <span className="font-mono text-xs text-slate-600">
                        v{rel.version}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">
                      Tag: {rel.tagName}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="warning">{rel.status}</Badge>
                    <a
                      href={`/releases/${rel.id}`}
                      className="px-2.5 py-1 text-xs font-medium rounded-lg bg-henu-50 text-henu-700 hover:bg-henu-100"
                    >
                      Review
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Latest Releases Pipeline */}
        <Card
          title="Recent Releases"
          subtitle="Latest releases received from connected GitHub repositories"
          action={
            <a
              href="/releases"
              className="text-xs font-semibold text-henu-600 hover:text-henu-700 flex items-center gap-1"
            >
              All Releases <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          }
        >
          {stats.latestReleases.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">
              No releases received yet. Trigger a GitHub release to test
              ingress.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {stats.latestReleases.map((rel) => (
                <div
                  key={rel.id}
                  className="py-3 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-slate-900">
                        {rel.application?.displayName || rel.application?.slug}
                      </span>
                      <span className="font-mono text-xs text-slate-600">
                        v{rel.version}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">
                      Channel: {rel.channel?.name || "STABLE"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusBadgeVariant(rel.status)}>
                      {rel.status}
                    </Badge>
                    <a
                      href={`/releases/${rel.id}`}
                      className="text-slate-400 hover:text-slate-600 p-1"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Audit & Operations Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Failed Webhooks Requiring Attention */}
        <Card
          title="Failed Webhook Ingress"
          subtitle="Events that encountered signature or validation errors"
          action={
            <a
              href="/webhooks"
              className="text-xs font-semibold text-henu-600 hover:text-henu-700 flex items-center gap-1"
            >
              Webhooks Log <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          }
        >
          {stats.failedWebhooks.length === 0 ? (
            <div className="py-6 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <span>Zero failed webhook events.</span>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.failedWebhooks.map((wh) => (
                <div
                  key={wh.id}
                  className="p-3 rounded-lg bg-rose-50/60 border border-rose-100 flex items-center justify-between"
                >
                  <div>
                    <span className="font-mono text-xs text-rose-900 font-semibold">
                      {wh.deliveryId}
                    </span>
                    <p className="text-xs text-rose-700 truncate max-w-sm mt-0.5">
                      {wh.lastError || "Unknown error"}
                    </p>
                  </div>
                  <a
                    href={`/webhooks`}
                    className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 shadow-2xs"
                  >
                    Replay
                  </a>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Audit Log */}
        <Card
          title="Recent Administrative Activity"
          subtitle="Append-only record of operations and identity mutations"
          action={
            <a
              href="/audit"
              className="text-xs font-semibold text-henu-600 hover:text-henu-700 flex items-center gap-1"
            >
              Full Audit Trail <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          }
        >
          <div className="divide-y divide-slate-100">
            {stats.recentAudit.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="py-2.5 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-semibold text-slate-900">
                    {log.action}
                  </span>
                  <span className="text-slate-400 ml-2">
                    by {log.actorEmail}
                  </span>
                </div>
                <span className="text-slate-400">
                  {new Date(log.createdAt).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
