"use client";

import React from "react";
import {
  Building2,
  Mail,
  Phone,
  MessageSquare,
  Calendar,
  Globe,
  Clock,
  ShieldCheck,
  FileText,
  MapPin,
  ExternalLink,
} from "lucide-react";

export default function SupportPage() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#171329] via-[#2A1E5C] to-[#6D4AFF] p-8 text-white shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-[#DCD5FF]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#DCD5FF]" />
              Official Corporate Operations & Governance
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              HENU OS PRIVATE LIMITED
            </h1>
            <p className="text-[#DCD5FF] text-sm max-w-2xl leading-relaxed">
              Enterprise administration support, technical escalation desk, corporate governance records, and strategic consultation channels for the HENU Platform ecosystem.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <a
              href="https://calendly.com/henuos/30min"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#6D4AFF] text-white hover:bg-[#5B37EB] font-medium text-sm transition-all shadow-md hover:shadow-indigo-500/25"
            >
              <Calendar className="w-4 h-4" />
              Schedule Strategy Call
            </a>
            <a
              href="https://www.henuos.in/contact"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium text-sm transition-all backdrop-blur-md"
            >
              <Globe className="w-4 h-4" />
              Corporate Portal
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
          </div>
        </div>
      </div>

      {/* Corporate Identity & Compliance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs hover:shadow-sm transition-all">
          <div className="w-10 h-10 rounded-xl bg-[#F0EEFF] text-[#6D4AFF] flex items-center justify-center mb-4">
            <Building2 className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Registered Entity
          </h2>
          <p className="mt-1 text-base font-bold text-slate-900">
            HENU OS PRIVATE LIMITED
          </p>
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Corporate Identity (CIN):</span>
              <span className="font-mono font-semibold text-slate-800">U62099RJ2025PTC109150</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">GST Registration:</span>
              <span className="font-mono font-semibold text-slate-800">08AAICH3195C1ZL</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Official Website:</span>
              <a
                href="https://www.henuos.in/"
                target="_blank"
                rel="noreferrer"
                className="text-[#6D4AFF] font-medium hover:underline inline-flex items-center gap-1"
              >
                henuos.in
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs hover:shadow-sm transition-all">
          <div className="w-10 h-10 rounded-xl bg-[#F0EEFF] text-[#6D4AFF] flex items-center justify-center mb-4">
            <MapPin className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Corporate Headquarters
          </h2>
          <p className="mt-1 text-sm font-semibold text-slate-900 leading-snug">
            Second Floor, 10b-204, Pali Aasan Home
          </p>
          <p className="text-xs text-slate-600 mt-1">
            Bhagesar Road, Pali, Rajasthan 306401, India
          </p>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5 text-[#6D4AFF]" />
            <span>IST (UTC+05:30) Operations</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs hover:shadow-sm transition-all">
          <div className="w-10 h-10 rounded-xl bg-[#F0EEFF] text-[#6D4AFF] flex items-center justify-center mb-4">
            <Clock className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Operational Hours
          </h2>
          <p className="mt-1 text-base font-bold text-slate-900">
            Monday – Saturday
          </p>
          <p className="text-xs text-slate-600 mt-1">
            09:30 AM – 06:30 PM IST
          </p>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-emerald-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Active Service Window & SRE On-Call
          </div>
        </div>
      </div>

      {/* Categorized Communication Channels */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#6D4AFF]" />
          Enterprise Support Desks
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* General Enquiries & Scope */}
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:border-[#DCD5FF] transition-colors">
            <div>
              <div className="w-9 h-9 rounded-lg bg-[#F0EEFF] text-[#6D4AFF] flex items-center justify-center mb-3">
                <Mail className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                General Enquiries & Scope
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Platform partnership proposals, project scopes, and official corporate communication.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100">
              <a
                href="mailto:info@henuos.in"
                className="text-xs font-semibold text-[#6D4AFF] hover:underline break-all"
              >
                info@henuos.in
              </a>
            </div>
          </div>

          {/* Technical Operations */}
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:border-[#DCD5FF] transition-colors">
            <div>
              <div className="w-9 h-9 rounded-lg bg-[#F0EEFF] text-[#6D4AFF] flex items-center justify-center mb-3">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Technical Operations
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Release pipeline queries, webhook ingestion failures, and system SRE escalations.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100">
              <a
                href="mailto:support.henuos@gmail.com"
                className="text-xs font-semibold text-[#6D4AFF] hover:underline break-all"
              >
                support.henuos@gmail.com
              </a>
            </div>
          </div>

          {/* Direct Enterprise Phone */}
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:border-[#DCD5FF] transition-colors">
            <div>
              <div className="w-9 h-9 rounded-lg bg-[#F0EEFF] text-[#6D4AFF] flex items-center justify-center mb-3">
                <Phone className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Direct Enterprise Phone
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Voice communications for urgent escalation during business operating hours.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100">
              <a
                href="tel:+918094100513"
                className="text-xs font-semibold text-[#6D4AFF] hover:underline"
              >
                +91 8094100513
              </a>
            </div>
          </div>

          {/* WhatsApp Support */}
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:border-[#DCD5FF] transition-colors">
            <div>
              <div className="w-9 h-9 rounded-lg bg-[#F0EEFF] text-[#6D4AFF] flex items-center justify-center mb-3">
                <MessageSquare className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                WhatsApp Enterprise Desk
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Immediate chat assistance with release engineers and customer success teams.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100">
              <a
                href="https://wa.me/918094100513"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#6D4AFF] hover:underline"
              >
                Chat on WhatsApp
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
