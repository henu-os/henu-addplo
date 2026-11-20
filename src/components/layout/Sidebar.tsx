"use client";

import React from "react";
import Link from "next/navigation";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Boxes,
  GitBranch,
  Layers,
  Cpu,
  BookOpen,
  History,
  RotateCcw,
  Users,
  ShieldCheck,
  FileText,
  Webhook,
  BellRing,
  Settings,
  Sparkles,
  HelpCircle,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  const sections: NavSection[] = [
    {
      title: "Overview",
      items: [
        {
          name: "Dashboard",
          href: "/",
          icon: <LayoutDashboard className="w-4 h-4" />,
        },
      ],
    },
    {
      title: "Ecosystem & Catalog",
      items: [
        {
          name: "Applications",
          href: "/apps",
          icon: <Boxes className="w-4 h-4" />,
        },
        {
          name: "GitHub Repos",
          href: "/repositories",
          icon: <GitBranch className="w-4 h-4" />,
        },
        {
          name: "Releases",
          href: "/releases",
          icon: <Layers className="w-4 h-4" />,
        },
        {
          name: "Channels",
          href: "/channels",
          icon: <Sparkles className="w-4 h-4" />,
        },
        {
          name: "Platform Compat",
          href: "/compatibilities",
          icon: <Cpu className="w-4 h-4" />,
        },
      ],
    },
    {
      title: "Public Catalogue",
      items: [
        {
          name: "Catalogue Preview",
          href: "/catalogue/preview",
          icon: <BookOpen className="w-4 h-4" />,
        },
        {
          name: "Publishing",
          href: "/catalogue/publish",
          icon: <Sparkles className="w-4 h-4" />,
        },
        {
          name: "Revision History",
          href: "/catalogue/revisions",
          icon: <History className="w-4 h-4" />,
        },
        {
          name: "Rollback",
          href: "/catalogue/rollback",
          icon: <RotateCcw className="w-4 h-4" />,
        },
      ],
    },
    {
      title: "Access & Governance",
      items: [
        {
          name: "Admin Users",
          href: "/users",
          icon: <Users className="w-4 h-4" />,
        },
        {
          name: "Roles & Perms",
          href: "/roles",
          icon: <ShieldCheck className="w-4 h-4" />,
        },
        {
          name: "Audit Logs",
          href: "/audit",
          icon: <FileText className="w-4 h-4" />,
        },
      ],
    },
    {
      title: "Operations",
      items: [
        {
          name: "Webhook Events",
          href: "/webhooks",
          icon: <Webhook className="w-4 h-4" />,
        },
        {
          name: "Notifications",
          href: "/notifications",
          icon: <BellRing className="w-4 h-4" />,
        },
        {
          name: "System Settings",
          href: "/settings",
          icon: <Settings className="w-4 h-4" />,
        },
      ],
    },
    {
      title: "Organization & Support",
      items: [
        {
          name: "Company & Helpdesk",
          href: "/support",
          icon: <HelpCircle className="w-4 h-4" />,
        },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen fixed left-0 top-0 z-30 select-none">
      {/* Brand header */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-100 flex-shrink-0">
        <div className="w-9 h-9 rounded-xl bg-henu-brand flex items-center justify-center p-1.5 shadow-sm shadow-indigo-200">
          <img
            src="/henu-logo.png"
            alt="HENU OS"
            className="w-full h-full object-contain"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>
        <div>
          <span className="font-bold text-henu-ink text-sm tracking-tight">
            HENU OS
          </span>
          <span className="ml-1.5 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-henu-100 text-henu-brand border border-henu-200">
            Console
          </span>
        </div>
      </div>

      {/* Nav items */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {sections.map((section) => (
          <div key={section.title}>
            <h4 className="px-3 mb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {section.title}
            </h4>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? "bg-henu-50 text-henu-700 font-semibold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={active ? "text-henu-600" : "text-slate-400"}
                      >
                        {item.icon}
                      </span>
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {item.badge}
                      </span>
                    )}
                  </a>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer system info */}
      <div className="p-3 border-t border-slate-100 text-center">
        <p className="text-[11px] text-slate-400">HENU Platform API v1.0.0</p>
      </div>
    </aside>
  );
};
