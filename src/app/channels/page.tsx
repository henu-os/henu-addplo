"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ReleaseChannel } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LoadingState } from "@/components/ui/LoadingState";
import { Sparkles, CheckCircle, ShieldCheck } from "lucide-react";

export default function ChannelsPage() {
  const [channels, setChannels] = useState<ReleaseChannel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await api.listChannels();
      setChannels(data);
      setLoading(false);
    }
    load();
  }, []);

  if (loading)
    return <LoadingState message="Loading release distribution channels..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Release Channels
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Ecosystem release distribution tracks for standard users, early
          adopters, and continuous development builds.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {channels.map((ch) => (
          <Card key={ch.id} className="relative overflow-hidden">
            {ch.isDefault && (
              <div className="absolute top-0 right-0 bg-henu-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                Default
              </div>
            )}

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-henu-50 text-henu-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{ch.name}</h3>
                <span className="text-xs text-slate-400">
                  Distribution Track
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              {ch.description ||
                "Configured distribution channel for platform releases."}
            </p>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Approval Policy:</span>
              <span className="font-semibold text-slate-700">
                {ch.name === "STABLE"
                  ? "Strict Administrator Gate"
                  : "Automatic / Staged"}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
