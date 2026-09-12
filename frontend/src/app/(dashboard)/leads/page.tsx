"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/axios";
import Link from "next/link";
import { Search, ExternalLink, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeadSummary {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  source: string;
  score: number;
  status: string;
  createdAt: string;
  lastContactedAt?: string;
  nextFollowUpAt?: string;
}

export default function LeadsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const { data: pageData, isLoading } = useQuery<{ content: LeadSummary[]; totalElements: number }>({
    queryKey: ["leads", search, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      const res: any = await api.get(`/leads?${params.toString()}`);
      return res.data;
    },
  });

  const leads = pageData?.content || [];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Inbound Leads</h1>
          <p className="text-sm text-slate-500">Manage and track leads processed by your AI Sales Employee</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/lead-form.html"
            target="_blank"
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium border border-slate-200 shadow-sm transition-all flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" /> Open Inbound Form
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, company, or email..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-indigo-500"
        >
          <option value="ALL">All Statuses</option>
          <option value="NEW">New</option>
          <option value="QUALIFYING">Qualifying</option>
          <option value="QUALIFIED">Qualified</option>
          <option value="HOT">Hot</option>
          <option value="MEETING_BOOKED">Meeting Booked</option>
          <option value="HUMAN_REVIEW">Human Review</option>
          <option value="NURTURE">Nurture</option>
          <option value="WON">Won</option>
          <option value="LOST">Lost</option>
        </select>
      </div>

      {/* Leads Table */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-200 font-semibold">
              <tr>
                <th className="px-6 py-3.5">Lead Name</th>
                <th className="px-6 py-3.5">Company</th>
                <th className="px-6 py-3.5">Source</th>
                <th className="px-6 py-3.5">AI Score</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Last Contact</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 text-sm">
                    Loading leads...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <p className="text-slate-600 font-medium text-sm">No leads match your filter</p>
                    <p className="text-slate-400 text-xs mt-1">Submit an inquiry on the embeddable form to test AI lead ingestion</p>
                  </td>
                </tr>
              ) : (
                leads.map((lead) => {
                  const isHot = lead.score >= 80 || lead.status === "HOT";
                  return (
                    <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        <Link href={`/leads/${lead.id}`} className="hover:text-indigo-600 flex items-center gap-2">
                          {lead.firstName} {lead.lastName}
                          {isHot && <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />}
                        </Link>
                        <span className="text-xs text-slate-400 font-normal block">{lead.email}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{lead.company || "—"}</td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-500">{lead.source}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-xs font-bold",
                          lead.score >= 80 ? "bg-rose-50 text-rose-700 border border-rose-200" :
                          lead.score >= 60 ? "bg-amber-50 text-amber-700 border border-amber-200" :
                          "bg-blue-50 text-blue-700 border border-blue-200"
                        )}>
                          {lead.score} / 100
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2.5 py-0.5 rounded-full text-xs font-semibold",
                          lead.status === "HOT" ? "bg-rose-50 text-rose-700" :
                          lead.status === "MEETING_BOOKED" ? "bg-violet-50 text-violet-700" :
                          lead.status === "QUALIFIED" ? "bg-emerald-50 text-emerald-700" :
                          lead.status === "HUMAN_REVIEW" ? "bg-orange-50 text-orange-700" :
                          lead.status === "NURTURE" ? "bg-slate-100 text-slate-700 border border-slate-300" :
                          "bg-slate-100 text-slate-600"
                        )}>
                          {lead.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {lead.lastContactedAt ? new Date(lead.lastContactedAt).toLocaleDateString() : "Pending"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/leads/${lead.id}`}
                          className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 font-semibold transition-colors"
                        >
                          Details →
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
