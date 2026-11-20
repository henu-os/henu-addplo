"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import {
  ArrowLeft,
  CheckCircle2,
  GitBranch,
  Layers,
  ShieldCheck,
  Cpu,
} from "lucide-react";

export default function NewApplicationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [category, setCategory] = useState("Productivity");
  const [appType, setAppType] = useState("DESKTOP");
  const [minHubVersion, setMinHubVersion] = useState("1.0.0");
  const [webAppUrl, setWebAppUrl] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [visibility, setVisibility] = useState("PUBLIC");

  // GitHub Repository Linkage
  const [repoOwner, setRepoOwner] = useState("henu-os");
  const [repoName, setRepoName] = useState("");
  const [githubInstallationId, setGithubInstallationId] = useState("183938025");
  const [assetPattern, setAssetPattern] = useState(
    "^henu-(.+)-(windows|macos|linux)-(x64|arm64|universal)\\.(exe|msi|dmg|pkg|deb|rpm|appimage)$",
  );
  const [validatingRepo, setValidatingRepo] = useState(false);
  const [repoValidationResult, setRepoValidationResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleTestRepoConnection = async () => {
    if (!repoOwner.trim() || !repoName.trim()) {
      setRepoValidationResult({
        success: false,
        message: "Please enter both GitHub Owner and Repository Name first.",
      });
      return;
    }

    setValidatingRepo(true);
    setRepoValidationResult(null);

    try {
      const res = await api.validateRepository({
        repoOwner: repoOwner.trim().toLowerCase(),
        repoName: repoName.trim().toLowerCase(),
        githubInstallationId: Number(githubInstallationId) || 183938025,
      });

      if (res.valid) {
        setRepoValidationResult({
          success: true,
          message: `✓ Verified: ${res.repoFullName} is accessible by HENU Release Manager (${res.defaultBranch} branch, ${res.isPrivate ? "private" : "public"}).`,
        });
      } else {
        setRepoValidationResult({
          success: false,
          message: res.message || "Repository access validation failed.",
        });
      }
    } catch (err: any) {
      setRepoValidationResult({
        success: false,
        message: err.message || "Failed to validate repository access.",
      });
    } finally {
      setValidatingRepo(false);
    }
  };

  // Platform Compatibility Selections
  const [selectedOS, setSelectedOS] = useState<string[]>([
    "WINDOWS",
    "MACOS",
    "LINUX",
  ]);
  const [selectedArch, setSelectedArch] = useState<string[]>([
    "X86_64",
    "ARM64",
  ]);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([
    "EXE",
    "DMG",
    "APPIMAGE",
  ]);

  const handleSlugAutoFill = (val: string) => {
    setName(val);
    const generatedSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    if (!slug || slug === "") {
      setSlug(generatedSlug);
    }
    if (!repoName || repoName === "") {
      setRepoName(generatedSlug);
    }
    if (!iconUrl || iconUrl === "") {
      setIconUrl(`https://cdn.henuos.example/assets/icons/${generatedSlug || "app"}.svg`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const cleanSlug = slug.trim().toLowerCase();
      const defaultIcon =
        iconUrl.trim() ||
        `https://cdn.henuos.example/assets/icons/${cleanSlug || "app"}.svg`;

      // 1. Create Application in Platform API
      const createdApp = await api.createApplication({
        slug: cleanSlug,
        displayName: name.trim(),
        appType: appType as any,
        category,
        summary: summary.trim(),
        description: description.trim(),
        iconUrl: defaultIcon,
        bannerUrl: bannerUrl.trim() || undefined,
        minHubVersion: minHubVersion.trim() || "1.0.0",
        webAppUrl:
          appType === "WEB" || appType === "HYBRID"
            ? webAppUrl.trim()
            : undefined,
        status: status as any,
      });

      // 2. Register GitHub Repository Connection (optional / non-blocking)
      if (repoOwner.trim() && repoName.trim()) {
        try {
          const createdConn = await api.createRepository({
            applicationId: createdApp.id,
            repoOwner: repoOwner.trim().toLowerCase(),
            repoName: repoName.trim().toLowerCase(),
            githubInstallationId: Number(githubInstallationId) || 183938025,
            assetPattern: assetPattern.trim(),
            autoIngestReleases: true,
            autoPublishChannels: ["BETA"],
            isActive: true,
          });

          // 3. Trigger initial repository access verification
          if (createdConn?.id) {
            try {
              await api.syncRepository(createdConn.id);
            } catch {
              // Non-blocking sync check
            }
          }
        } catch (repoErr: any) {
          console.warn("Repository connection note:", repoErr);
        }
      }

      setSuccess(
        `Application '${createdApp.displayName}' registered successfully! Redirecting...`,
      );
      setTimeout(() => {
        router.push(`/apps/${createdApp.id}`);
      }, 1500);
    } catch (err: any) {
      if (Array.isArray(err.errors) && err.errors.length > 0) {
        setError(err.errors.join(" • "));
      } else if (typeof err.errors === "object" && err.errors !== null) {
        const msgs = Object.values(err.errors).flat();
        setError(msgs.length > 0 ? (msgs as string[]).join(" • ") : err.message);
      } else {
        setError(err.message || "Failed to create application.");
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (
    list: string[],
    setList: (val: string[]) => void,
    item: string,
  ) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back button and page title */}
      <div>
        <a
          href="/apps"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Applications
        </a>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Register New Application
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Add an application to the HENU ecosystem and configure its upstream
          GitHub repository connection.
        </p>
      </div>

      {error && (
        <Alert type="error" message={error} onClose={() => setError(null)} />
      )}
      {success && <Alert type="success" message={success} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Information */}
        <Card
          title="1. Basic Information"
          subtitle="General identity and metadata for the application card"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Display Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleSlugAutoFill(e.target.value)}
                placeholder="e.g. HENU Personal Assistant"
                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-henu-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Application ID (Slug) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                pattern="^[a-z0-9]+(-[a-z0-9]+)*$"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase())}
                placeholder="e.g. henu-pa"
                className="w-full text-sm font-mono rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-henu-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-henu-500"
              >
                <option value="Productivity">Productivity</option>
                <option value="Developer Tools">Developer Tools</option>
                <option value="Communication">Communication</option>
                <option value="Utility">Utility</option>
                <option value="AI & Automation">AI & Automation</option>
                <option value="System & Platform">System & Platform</option>
                <option value="Data & Records">Data & Records</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Application Type <span className="text-rose-500">*</span>
              </label>
              <select
                value={appType}
                onChange={(e) => setAppType(e.target.value)}
                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-henu-500"
              >
                <option value="DESKTOP">Native Desktop Application</option>
                <option value="WEB">Web Application (Hosted URL)</option>
                <option value="CLI">CLI Tool</option>
                <option value="HYBRID">Hybrid Application</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Short Summary (Catalogue Card){" "}
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={200}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="One-line overview displayed in store listings"
                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-henu-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Description (Markdown){" "}
                <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed Markdown overview, feature highlights, and capabilities..."
                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-henu-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Icon URL
                </label>
                {!iconUrl && (
                  <button
                    type="button"
                    onClick={() =>
                      setIconUrl(
                        `https://cdn.henuos.example/assets/icons/${slug || "app"}.svg`,
                      )
                    }
                    className="text-[11px] text-henu-600 hover:text-henu-700 font-medium"
                  >
                    Set Default SVG
                  </button>
                )}
              </div>
              <input
                type="text"
                value={iconUrl}
                onChange={(e) => setIconUrl(e.target.value)}
                placeholder="https://cdn.henuos.example/assets/icons/app.svg"
                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-henu-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Leave blank to automatically use standard brand SVG asset.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Banner URL (Optional)
              </label>
              <input
                type="text"
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                placeholder="https://cdn.henuos.example/assets/banners/app.png"
                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-henu-500"
              />
            </div>

            {(appType === "WEB" || appType === "HYBRID") && (
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Web Application Target URL{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={webAppUrl}
                  onChange={(e) => setWebAppUrl(e.target.value)}
                  placeholder="https://app.henuos.com"
                  className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-henu-500"
                />
              </div>
            )}
          </div>
        </Card>

        {/* Section 2: GitHub Repository Connection */}
        <Card
          title="2. GitHub Repository Integration"
          subtitle="Configure release ingestion webhooks and binary asset patterns"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                GitHub Owner / Organization{" "}
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={repoOwner}
                onChange={(e) => setRepoOwner(e.target.value)}
                placeholder="henu-os"
                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-henu-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                GitHub Repository Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                placeholder="henu-pa"
                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-henu-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                GitHub App Installation ID{" "}
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                value={githubInstallationId}
                onChange={(e) => setGithubInstallationId(e.target.value)}
                placeholder="123456"
                className="w-full text-sm font-mono rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-henu-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Minimum HENU HUB Version{" "}
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={minHubVersion}
                onChange={(e) => setMinHubVersion(e.target.value)}
                placeholder="1.0.0"
                className="w-full text-sm font-mono rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-henu-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Asset Matching Regex Pattern{" "}
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={assetPattern}
                onChange={(e) => setAssetPattern(e.target.value)}
                className="w-full text-sm font-mono rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-henu-500"
              />
              <p className="text-xs text-slate-400 mt-1">
                Regular expression used to classify and extract OS,
                architecture, and format from binary filenames.
              </p>
            </div>

            {/* Test Connection Button & Result */}
            <div className="md:col-span-2 pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleTestRepoConnection}
                disabled={validatingRepo}
                className="inline-flex items-center justify-center px-4 py-2 border border-slate-300 shadow-xs text-xs font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-henu-500 disabled:opacity-50"
              >
                {validatingRepo ? "Checking GitHub Access..." : "Test GitHub Connection"}
              </button>

              {repoValidationResult && (
                <div
                  className={`text-xs px-3 py-1.5 rounded-lg flex items-center font-medium ${
                    repoValidationResult.success
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-rose-50 text-rose-700 border border-rose-200"
                  }`}
                >
                  {repoValidationResult.message}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Section 3: Supported Platforms & Formats */}
        <Card
          title="3. Supported Platform Matrix"
          subtitle="Define initial target operating systems and distribution binary formats"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Operating Systems
              </label>
              <div className="flex flex-wrap gap-2">
                {["WINDOWS", "MACOS", "LINUX"].map((os) => (
                  <button
                    key={os}
                    type="button"
                    onClick={() => toggleItem(selectedOS, setSelectedOS, os)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                      selectedOS.includes(os)
                        ? "bg-henu-50 text-henu-700 border-henu-300"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {os}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                CPU Architectures
              </label>
              <div className="flex flex-wrap gap-2">
                {["X86_64", "ARM64", "UNIVERSAL"].map((arch) => (
                  <button
                    key={arch}
                    type="button"
                    onClick={() =>
                      toggleItem(selectedArch, setSelectedArch, arch)
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                      selectedArch.includes(arch)
                        ? "bg-henu-50 text-henu-700 border-henu-300"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {arch}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Package Formats
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  "EXE",
                  "MSI",
                  "DMG",
                  "PKG",
                  "APPIMAGE",
                  "DEB",
                  "RPM",
                  "TAR_GZ",
                  "ZIP",
                ].map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() =>
                      toggleItem(selectedFormats, setSelectedFormats, fmt)
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                      selectedFormats.includes(fmt)
                        ? "bg-henu-50 text-henu-700 border-henu-300"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Section 4: Lifecycle & Visibility */}
        <Card title="4. Status & Publication Policy">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-henu-500"
              >
                <option value="ACTIVE">Active (Available in Store)</option>
                <option value="DRAFT">Draft (Hidden from Public)</option>
                <option value="MAINTENANCE">Maintenance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Visibility
              </label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-henu-500"
              >
                <option value="PUBLIC">
                  Public (Catalogue Search & Featured)
                </option>
                <option value="UNLISTED">Unlisted (Direct Link Only)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => router.push("/apps")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={loading}
            icon={<CheckCircle2 className="w-4 h-4" />}
          >
            Register Application & Connect Repository
          </Button>
        </div>
      </form>
    </div>
  );
}
