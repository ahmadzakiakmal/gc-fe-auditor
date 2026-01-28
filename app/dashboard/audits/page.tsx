"use client";
import Breadcrumb from "@/components/shared/Breadcrumb";
import ContentCard from "@/components/shared/ContentCard";
import { FileText, Eye, Filter } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import TabSwitcher from "@/components/shared/TabSwitcher";

export default function AuditsListPage() {
  const breadcrumbData = [
    {
      label: "Dashboard",
      url: "/dashboard",
    },
    {
      label: "Audits",
      url: "/dashboard/audits",
    },
  ];

  const [statusFilter, setStatusFilter] = useState("all");

  // Placeholder audits data
  const [audits] = useState([
    {
      id: 1,
      repository_name: "smart-contract-vault",
      client: "octocat",
      files_count: 8,
      status: "PENDING_REVIEW",
      payment_status: "PAID",
      submitted_date: "2025-01-26T10:30:00Z",
      priority: "high",
      amount: 400,
    },
    {
      id: 2,
      repository_name: "defi-protocol",
      client: "ethereum-dev",
      files_count: 12,
      status: "IN_PROGRESS",
      payment_status: "PAID",
      submitted_date: "2025-01-25T14:20:00Z",
      priority: "medium",
      amount: 600,
    },
    {
      id: 3,
      repository_name: "nft-marketplace",
      client: "web3-builder",
      files_count: 6,
      status: "COMPLETED",
      payment_status: "PAID",
      submitted_date: "2025-01-22T09:15:00Z",
      priority: "low",
      amount: 300,
    },
    {
      id: 4,
      repository_name: "dao-governance",
      client: "octocat",
      files_count: 10,
      status: "PENDING_REVIEW",
      payment_status: "PAID",
      submitted_date: "2025-01-27T16:45:00Z",
      priority: "high",
      amount: 500,
    },
    {
      id: 5,
      repository_name: "token-bridge",
      client: "cross-chain-dev",
      files_count: 15,
      status: "IN_PROGRESS",
      payment_status: "PAID",
      submitted_date: "2025-01-24T11:30:00Z",
      priority: "high",
      amount: 750,
    },
    {
      id: 6,
      repository_name: "staking-pool",
      client: "defi-team",
      files_count: 9,
      status: "COMPLETED",
      payment_status: "PAID",
      submitted_date: "2025-01-20T08:00:00Z",
      priority: "medium",
      amount: 450,
    },
  ]);

  const statusTabs = [
    { label: "All", value: "all" },
    { label: "Pending Review", value: "PENDING_REVIEW" },
    { label: "In Progress", value: "IN_PROGRESS" },
    { label: "Completed", value: "COMPLETED" },
  ];

  const filteredAudits = statusFilter === "all" ? audits : audits.filter((audit) => audit.status === statusFilter);

  return (
    <main className="bg-light-secondary dark:bg-slate-950 w-full h-screen overflow-y-auto p-10">
      <Breadcrumb data={breadcrumbData} />
      <h1 className="text-[32px] font-semibold text-blue-gc-dark dark:text-white">All Audits</h1>
      <p className="font-semibold text-grey-dark dark:text-grey-gc mt-2">Review and manage all paid audit requests</p>

      <ContentCard className="my-7">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-[20px] font-semibold text-blue-gc-dark dark:text-white">
              Paid Audits ({filteredAudits.length})
            </h2>
            <p className="font-semibold text-grey-dark dark:text-grey-gc text-sm">
              Filter and manage your assigned audits
            </p>
          </div>
          <TabSwitcher
            data={statusTabs}
            state={statusFilter}
            setState={setStatusFilter}
          />
        </div>

        {/* Empty State */}
        {filteredAudits.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 p-12">
            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full">
              <FileText className="size-12 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-slate-700 dark:text-slate-300 font-semibold text-lg">No audits in this category</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm text-center max-w-sm">
              {statusFilter === "all"
                ? "No paid audits available at the moment"
                : `No audits with status "${statusTabs.find((t) => t.value === statusFilter)?.label}"`}
            </p>
          </div>
        )}

        {/* Audit Cards */}
        {filteredAudits.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAudits.map((audit) => (
              <AuditCard
                key={audit.id}
                audit={audit}
              />
            ))}
          </div>
        )}
      </ContentCard>
    </main>
  );
}

function AuditCard({ audit }: { audit: any }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING_REVIEW":
        return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400";
      case "IN_PROGRESS":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400";
      case "COMPLETED":
        return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400";
      default:
        return "bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-400";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 dark:text-red-400";
      case "medium":
        return "text-amber-600 dark:text-amber-400";
      case "low":
        return "text-slate-600 dark:text-slate-400";
      default:
        return "text-slate-600 dark:text-slate-400";
    }
  };

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-4">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="bg-purple-600/20 text-purple-600 dark:text-purple-500 p-2 rounded-md shrink-0">
            <FileText size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-sm text-slate-700 dark:text-slate-200 truncate">{audit.repository_name}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">by {audit.client}</p>
          </div>
        </div>
        <span className={`text-xs font-bold uppercase shrink-0 ${getPriorityColor(audit.priority)}`}>
          {audit.priority}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">FILES</span>
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{audit.files_count}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">AMOUNT</span>
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">${audit.amount}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">SUBMITTED</span>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {formatDate(audit.submitted_date)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">STATUS</span>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(audit.status)}`}>
            {audit.status.replace("_", " ")}
          </span>
        </div>
      </div>

      {/* Action */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
        <Link href={`/dashboard/audits/${audit.id}`}>
          <button className="w-full text-sm font-medium bg-slate-100 hover:bg-slate-200 dark:text-slate-200 dark:bg-slate-700 dark:hover:bg-slate-800 rounded-lg duration-200 flex items-center justify-center h-9 gap-2">
            <Eye size={16} />
            {audit.status === "PENDING_REVIEW" ? "Start Review" : "Continue Review"}
          </button>
        </Link>
      </div>
    </div>
  );
}
