"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Application } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LoadingState } from "@/components/ui/LoadingState";
import { Cpu, Monitor, Apple, Terminal } from "lucide-react";

export default function PlatformCompatibilityPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await api.listApplications({ limit: 100 });
      setApps(res.data);
      setLoading(false);
    }
    load();
  }, []);

  if (loading)
    return <LoadingState message="Loading platform compatibility matrix..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Platform Compatibility Matrix
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Supported operating systems, CPU architectures, and installer formats
          configured across all registered applications.
        </p>
      </div>

      <div className="space-y-6">
        {apps.map((app) => (
          <Card
            key={app.id}
            title={app.displayName}
            subtitle={`Slug: ${app.slug} • Type: ${app.appType}`}
          >
            {!app.compatibilities || app.compatibilities.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">
                No platform profiles configured. Application will be classified
                using default matching rules.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {app.compatibilities.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-xs text-slate-900 flex items-center gap-1.5">
                        {c.os === "WINDOWS" ? (
                          <Monitor className="w-3.5 h-3.5 text-sky-600" />
                        ) : c.os === "MACOS" ? (
                          <Apple className="w-3.5 h-3.5 text-slate-800" />
                        ) : (
                          <Terminal className="w-3.5 h-3.5 text-amber-600" />
                        )}
                        {c.os} ({c.arch})
                      </div>
                      <span className="font-mono text-[11px] text-slate-500">
                        {c.packageFormat}
                      </span>
                    </div>
                    <Badge variant={c.isSupported ? "success" : "danger"}>
                      {c.isSupported ? "Active" : "Disabled"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
