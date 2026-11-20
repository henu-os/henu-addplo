"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { LogOut, User as UserIcon, Shield } from "lucide-react";
import { Button } from "../ui/Button";

export const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-20 px-8 flex items-center justify-between shadow-2xs">
      <div className="flex items-center gap-3">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-xs font-medium text-slate-500">
          Connected to Platform API:{" "}
          <span className="font-mono text-slate-700">v1.0.0</span>
        </span>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
              <div className="w-7 h-7 rounded-full bg-henu-100 text-henu-700 flex items-center justify-center text-xs font-bold">
                {user.fullName ? user.fullName[0].toUpperCase() : "U"}
              </div>
              <div className="text-left">
                <div className="text-xs font-semibold text-slate-900 leading-tight">
                  {user.fullName || user.email}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                  <Shield className="w-3 h-3 text-henu-600" />
                  <span>{typeof user.role === "string" ? user.role : user.role?.name || "ADMINISTRATOR"}</span>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              icon={<LogOut className="w-3.5 h-3.5" />}
              onClick={logout}
            >
              Sign out
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <UserIcon className="w-4 h-4" /> Not authenticated
          </div>
        )}
      </div>
    </header>
  );
};
