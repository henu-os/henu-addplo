"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { NotificationPolicy } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LoadingState } from "@/components/ui/LoadingState";
import { BellRing, Radio, Mail, Globe } from "lucide-react";

export default function NotificationsPage() {
  const [policies, setPolicies] = useState<NotificationPolicy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await api.listNotifications();
      setPolicies(
        data.length > 0
          ? data
          : [
              {
                id: "pol-1",
                eventTrigger: "RELEASE_PUBLISHED",
                channel: "SSE_HUB",
                targetDestination: "/api/v1/hub/events",
                isEnabled: true,
                createdAt: new Date().toISOString(),
              },
              {
                id: "pol-2",
                eventTrigger: "RELEASE_APPROVAL_REQUIRED",
                channel: "SSE_ADMIN",
                targetDestination: "/api/v1/admin/events",
                isEnabled: true,
                createdAt: new Date().toISOString(),
              },
              {
                id: "pol-3",
                eventTrigger: "CATALOGUE_REVISION_PUBLISHED",
                channel: "WEBHOOK_OUTBOUND",
                targetDestination: "https://cdn-edge.henuos.com/purge",
                isEnabled: true,
                createdAt: new Date().toISOString(),
              },
            ],
      );
      setLoading(false);
    }
    load();
  }, []);

  if (loading)
    return <LoadingState message="Loading notification policies..." />;

  const getChannelIcon = (ch: string) => {
    switch (ch) {
      case "SSE_HUB":
      case "SSE_ADMIN":
        return <Radio className="w-4 h-4 text-henu-600" />;
      case "EMAIL":
        return <Mail className="w-4 h-4 text-amber-600" />;
      default:
        return <Globe className="w-4 h-4 text-purple-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Notification Policies
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Server-Sent Events (SSE) and outbound webhook dispatch rules for
          client apps and administrators.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {policies.map((pol) => (
          <Card key={pol.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  {getChannelIcon(pol.channel)}
                </div>
                <span className="font-semibold text-xs text-slate-900">
                  {pol.channel}
                </span>
              </div>
              <Badge variant={pol.isEnabled ? "success" : "neutral"}>
                {pol.isEnabled ? "Active" : "Disabled"}
              </Badge>
            </div>

            <div>
              <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">
                Event Trigger
              </span>
              <p className="font-mono text-xs text-slate-800 font-bold mt-0.5">
                {pol.eventTrigger}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="text-[11px] text-slate-400 block mb-0.5">
                Destination:
              </span>
              <span className="font-mono text-[11px] text-slate-600 break-all block">
                {pol.targetDestination || "Default SSE Stream"}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
