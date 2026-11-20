"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Lock, Mail, Shield, KeyRound, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

export default function LoginPage() {
  const { login, mfaVerify } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [mfaToken, setMfaToken] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoError, setLogoError] = useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.mfaRequired && res.mfaToken) {
        setMfaToken(res.mfaToken);
      } else {
        router.push("/");
      }
    } catch (err: any) {
      setError(
        err.message || "Authentication failed. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaToken) return;

    setError(null);
    setLoading(true);

    try {
      await mfaVerify(mfaToken, mfaCode);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Invalid or expired 6-digit MFA code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex items-center justify-center mx-auto mb-4">
          {!logoError ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src="/henu-logo.png"
              alt="HENU OS"
              className="w-14 h-14 object-contain drop-shadow-md rounded-xl"
              onError={() => setLogoError(true)}
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-[#6D4AFF] text-white font-black text-2xl flex items-center justify-center shadow-md">
              H
            </div>
          )}
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          HENU Platform Administration
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Sign in with your authorized operator or administrator credentials.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200/80 rounded-2xl sm:px-10">
          {error && (
            <Alert
              type="error"
              message={error}
              className="mb-6"
              onClose={() => setError(null)}
            />
          )}

          {!mfaToken ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Admin Email
                </label>
                <div className="relative rounded-lg shadow-2xs">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@henuos.com"
                    className="block w-full rounded-lg border border-slate-300 pl-10 pr-3 py-2 text-sm text-slate-900 focus:border-henu-500 focus:outline-none focus:ring-1 focus:ring-henu-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative rounded-lg shadow-2xs">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="block w-full rounded-lg border border-slate-300 pl-10 pr-3 py-2 text-sm text-slate-900 focus:border-henu-500 focus:outline-none focus:ring-1 focus:ring-henu-500"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={loading}
                icon={<ArrowRight className="w-4 h-4" />}
                className="w-full"
              >
                Sign in to Console
              </Button>
            </form>
          ) : (
            <form onSubmit={handleMfaSubmit} className="space-y-5">
              <div className="p-4 rounded-xl bg-henu-50 border border-henu-200 text-henu-800 text-xs flex items-center gap-3">
                <Shield className="w-5 h-5 text-henu-600 flex-shrink-0" />
                <span>
                  Multi-factor authentication is active on your account. Enter
                  the 6-digit code or a single-use recovery code.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Authenticator Code
                </label>
                <div className="relative rounded-lg shadow-2xs">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <KeyRound className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={8}
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value.trim())}
                    placeholder="123456"
                    className="block w-full font-mono tracking-widest text-center text-lg rounded-lg border border-slate-300 pl-10 pr-3 py-2 text-slate-900 focus:border-henu-500 focus:outline-none focus:ring-1 focus:ring-henu-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setMfaToken(null)}
                  className="w-1/3"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={loading}
                  className="w-2/3"
                >
                  Verify MFA
                </Button>
              </div>
            </form>
          )}

          <div className="mt-8 border-t border-slate-100 pt-6">
            <p className="text-xs text-slate-400 text-center leading-relaxed">
              Protected by HENU Security Guard. Public registration is
              permanently disabled. Initial administrator access is provisioned
              via the secure Platform API CLI.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
