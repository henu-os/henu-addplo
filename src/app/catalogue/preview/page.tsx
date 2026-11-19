"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/LoadingState";
import { Alert } from "@/components/ui/Alert";
import { BookOpen, Copy, Check, ExternalLink } from "lucide-react";

export default function CataloguePreviewPage() {
  const [manifest, setManifest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getCataloguePreview();
        setManifest(data);
      } catch (err: any) {
        setError(err.message || "Failed to load public catalogue preview.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleCopy = () => {
    if (manifest) {
      navigator.clipboard.writeText(JSON.stringify(manifest, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading)
    return (
      <LoadingState message="Fetching live catalogue manifest from Platform API..." />
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Catalogue Live Preview
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Exact JSON manifest structure delivered to HENU HUB Desktop clients
            via CDN.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            icon={
              copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )
            }
            onClick={handleCopy}
          >
            {copied ? "Copied" : "Copy Manifest JSON"}
          </Button>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}

      {manifest && (
        <Card className="p-0 overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            <div className="flex items-center gap-4">
              <span>
                Schema:{" "}
                <strong className="text-slate-800">
                  {manifest.schemaVersion || "1.0.0"}
                </strong>
              </span>
              <span>
                Total Apps:{" "}
                <strong className="text-slate-800">
                  {manifest.applications?.length || 0}
                </strong>
              </span>
              <span>
                Generated:{" "}
                <strong className="text-slate-800">
                  {manifest.generatedAt
                    ? new Date(manifest.generatedAt).toLocaleString()
                    : "Live"}
                </strong>
              </span>
            </div>
            <Badge variant="brand">Draft 2020-12 Verified</Badge>
          </div>

          <pre className="p-6 text-xs text-slate-800 font-mono bg-slate-900 text-slate-100 overflow-x-auto max-h-[600px] leading-relaxed">
            {JSON.stringify(manifest, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  );
}
