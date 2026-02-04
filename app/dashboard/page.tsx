"use client";
import Breadcrumb from "@/components/shared/Breadcrumb";
import ContentCard from "@/components/shared/ContentCard";
import { useSession } from "@/context/SessionContext";
import { Report, ReportStatus } from "@/types/types";
import { FileText, Clock, CheckCircle, AlertCircle, Eye, FolderGit } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function AuditorDashboardPage() {
  const breadcrumbData = [
    {
      label: "Dashboard",
      url: "/dashboard",
    },
  ];

  // Empty array - will be populated from API later
  const { reports, refreshSession, isLoading } = useSession();

  useEffect(() => {
    refreshSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pendingReviews = reports?.filter((a) => a.status === ReportStatus.AUDITOR_REVIEW).length;
  const inProgress = reports?.filter(
    (a) => a.status === ReportStatus.AI_REVIEW || a.status === ReportStatus.AUDITOR_REVIEW,
  ).length;
  const completed = reports?.filter((a) => a.status === ReportStatus.DONE).length;

  return (
    <main className="font-family-jakarta bg-light-secondary dark:bg-slate-950 w-full h-screen overflow-y-auto p-10">
      <Breadcrumb data={breadcrumbData} />
      <h1 className="text-[32px] font-semibold text-blue-gc-dark dark:text-white">Auditor Dashboard</h1>
      <p className="font-semibold text-grey-dark dark:text-grey-gc mt-2">
        Review and manage your assigned security audits
      </p>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7 mt-7">
        <ContentCard className="">
          <div className="flex items-center gap-2">
            <div className="bg-purple-600/20 text-purple-600 dark:text-purple-500 p-2 rounded-md">
              <FileText size={20} />
            </div>
            <h1 className="font-bold text-sm text-slate-500">Total Audits</h1>
          </div>
          {isLoading ? (
            <div className="w-full h-6 pl-11 mt-3 rounded-lg bg-slate-300 dark:bg-slate-700 animate-pulse"></div>
          ) : (
            <p className="pl-11 mt-3 font-bold">{reports?.length}</p>
          )}
        </ContentCard>

        <ContentCard className="">
          <div className="flex items-center gap-2">
            <div className="bg-amber-600/20 text-amber-600 dark:text-amber-500 p-2 rounded-md">
              <Clock size={20} />
            </div>
            <h1 className="font-bold text-sm text-slate-500">Pending Review</h1>
          </div>
          {isLoading ? (
            <div className="w-full h-6 pl-11 mt-3 rounded-lg bg-slate-300 dark:bg-slate-700 animate-pulse"></div>
          ) : (
            <p className="pl-11 mt-3 font-bold">{pendingReviews}</p>
          )}
        </ContentCard>

        <ContentCard className="">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600/20 text-blue-600 dark:text-blue-500 p-2 rounded-md">
              <AlertCircle size={20} />
            </div>
            <h1 className="font-bold text-sm text-slate-500">In Progress</h1>
          </div>
          {isLoading ? (
            <div className="w-full h-6 pl-11 mt-3 rounded-lg bg-slate-300 dark:bg-slate-700 animate-pulse"></div>
          ) : (
            <p className="pl-11 mt-3 font-bold">{inProgress}</p>
          )}
        </ContentCard>

        <ContentCard className="">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-600/20 text-emerald-600 dark:text-emerald-500 p-2 rounded-md">
              <CheckCircle size={20} />
            </div>
            <h1 className="font-bold text-sm text-slate-500">Completed</h1>
          </div>
          {isLoading ? (
            <div className="w-full h-6 pl-11 mt-3 rounded-lg bg-slate-300 dark:bg-slate-700 animate-pulse"></div>
          ) : (
            <p className="pl-11 mt-3 font-bold">{completed}</p>
          )}
        </ContentCard>
      </div>

      {/* Assigned Audits */}
      <ContentCard className="my-7">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-[24px] font-semibold text-blue-gc-dark dark:text-white">Assigned Audits</h1>
            <p className="font-semibold text-grey-dark dark:text-grey-gc">Paid audits ready for your review</p>
          </div>
          {reports && reports?.length > 3 && (
            <Link href="/dashboard/audits">
              <button className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1">
                View All
              </button>
            </Link>
          )}
        </div>

        {isLoading ? (
          // Loading state
          <div className="grid grid-cols-3 gap-5">
            <div className="w-full h-50 bg-slate-300 dark:bg-slate-700 animate-pulse rounded-md"></div>
            <div className="w-full h-50 bg-slate-300 dark:bg-slate-700 animate-pulse rounded-md"></div>
            <div className="w-full h-50 bg-slate-300 dark:bg-slate-700 animate-pulse rounded-md"></div>
          </div>
        ) : !reports || reports.length <= 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-4 mb-4">
              <FolderGit className="w-8 h-8 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-lg font-semibold text-blue-gc-dark dark:text-white mb-2">No Audits Assigned</h3>
            <p className="text-sm text-grey-dark dark:text-grey-gc text-center max-w-sm">
              You don&apos;t have any audits assigned yet. New assignments will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports?.slice(0, 3).map((audit) => (
              <AuditCard
                key={audit.id}
                report={audit}
              />
            ))}
          </div>
        )}
      </ContentCard>
    </main>
  );
}

function AuditCard({ report }: { report: Report }) {
  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.AUDITOR_REVIEW:
        return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400";
      case ReportStatus.AI_REVIEW:
      case ReportStatus.NEED_DEV_REMEDIATION:
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400";
      case ReportStatus.DONE:
        return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400";
      case ReportStatus.QUEUE:
        return "bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-400";
      default:
        return "bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-400";
    }
  };

  const getStatusLabel = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.QUEUE:
        return "QUEUE";
      case ReportStatus.AI_REVIEW:
        return "Scanning";
      case ReportStatus.AUDITOR_REVIEW:
        return "In Review";
      case ReportStatus.NEED_DEV_REMEDIATION:
        return "Remediation";
      case ReportStatus.DEV_REMEDIATED:
        return "Remediated";
      case ReportStatus.DONE:
        return "Completed";
      default:
        return status;
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
            <h2 className="font-bold text-sm text-slate-700 dark:text-slate-200 truncate">
              {report.repo_url.split("/")[4]}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{report.paid ? "Paid" : "Unpaid"}</p>
          </div>
        </div>
        {report.progress > 0 && (
          <div className="text-xs font-bold text-blue-600 dark:text-blue-400">{report.progress}%</div>
        )}
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">FINDINGS</span>
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{report.findings?.length || 0}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">SUBMITTED</span>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {formatDate(report.created_at)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">STATUS</span>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(report.status)}`}>
            {getStatusLabel(report.status)}
          </span>
        </div>

        {report.progress > 0 && report.progress < 100 && (
          <div className="pt-2">
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all"
                style={{ width: `${report.progress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Action */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
        <Link
          href={
            report.status == ReportStatus.QUEUE
              ? `/dashboard/audits/${report.id}`
              : `/dashboard/audits/reports/${report.id}`
          }
        >
          <button className="w-full text-sm font-medium bg-slate-100 hover:bg-slate-200 dark:text-slate-200 dark:bg-slate-700 dark:hover:bg-slate-800 rounded-lg duration-200 flex items-center justify-center h-9 gap-2">
            <Eye size={16} />
            {report.status === ReportStatus.AUDITOR_REVIEW ? "Start Review" : "View Audit"}
          </button>
        </Link>
      </div>
    </div>
  );
}

