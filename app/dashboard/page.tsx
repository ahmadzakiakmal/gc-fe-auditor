"use client";
import Breadcrumb from "@/components/shared/Breadcrumb";
import ContentCard from "@/components/shared/ContentCard";
import { FileText, Clock, CheckCircle, AlertCircle, Eye } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function AuditorDashboardPage() {
  const breadcrumbData = [
    {
      label: "Dashboard",
      url: "/dashboard",
    },
  ];

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
    },
  ]);

  const pendingReviews = audits.filter((a) => a.status === "PENDING_REVIEW").length;
  const inProgress = audits.filter((a) => a.status === "IN_PROGRESS").length;
  const completed = audits.filter((a) => a.status === "COMPLETED").length;

  return (
    <main className="bg-light-secondary dark:bg-slate-950 w-full h-screen overflow-y-auto p-10">
      <Breadcrumb data={breadcrumbData} />
      <h1 className="text-[32px] font-semibold text-blue-gc-dark dark:text-white">Auditor Dashboard</h1>
      <p className="font-semibold text-grey-dark dark:text-grey-gc mt-2">
        Review and manage your assigned security audits
      </p>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7">
        <ContentCard className="my-7">
          <div className="flex items-center gap-2">
            <div className="bg-purple-600/20 text-purple-600 dark:text-purple-500 p-2 rounded-md">
              <FileText size={20} />
            </div>
            <h1 className="font-bold text-sm text-slate-500">Total Audits</h1>
          </div>
          <p className="pl-11 mt-3 font-bold">{audits.length}</p>
        </ContentCard>

        <ContentCard className="my-7">
          <div className="flex items-center gap-2">
            <div className="bg-amber-600/20 text-amber-600 dark:text-amber-500 p-2 rounded-md">
              <Clock size={20} />
            </div>
            <h1 className="font-bold text-sm text-slate-500">Pending Review</h1>
          </div>
          <p className="pl-11 mt-3 font-bold">{pendingReviews}</p>
        </ContentCard>

        <ContentCard className="my-7">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600/20 text-blue-600 dark:text-blue-500 p-2 rounded-md">
              <AlertCircle size={20} />
            </div>
            <h1 className="font-bold text-sm text-slate-500">In Progress</h1>
          </div>
          <p className="pl-11 mt-3 font-bold">{inProgress}</p>
        </ContentCard>

        <ContentCard className="my-7">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-600/20 text-emerald-600 dark:text-emerald-500 p-2 rounded-md">
              <CheckCircle size={20} />
            </div>
            <h1 className="font-bold text-sm text-slate-500">Completed</h1>
          </div>
          <p className="pl-11 mt-3 font-bold">{completed}</p>
        </ContentCard>
      </div>

      {/* Recent Audits */}
      <ContentCard className="my-7">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-[24px] font-semibold text-blue-gc-dark dark:text-white">Assigned Audits</h1>
            <p className="font-semibold text-grey-dark dark:text-grey-gc">Paid audits ready for your review</p>
          </div>
          <Link href="/dashboard/audits">
            <button className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1">
              View All
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {audits.slice(0, 3).map((audit) => (
            <AuditCard
              key={audit.id}
              audit={audit}
            />
          ))}
        </div>
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
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="bg-purple-600/20 text-purple-600 dark:text-purple-500 p-2 rounded-md shrink-0">
            <FileText size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-sm text-slate-700 dark:text-slate-200 truncate">{audit.repository_name}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">by {audit.client}</p>
          </div>
        </div>
        <span className={`text-xs font-bold uppercase ${getPriorityColor(audit.priority)}`}>{audit.priority}</span>
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">FILES</span>
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{audit.files_count}</span>
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
