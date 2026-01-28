import { Dispatch, SetStateAction } from "react";
import { FileDown, FileText } from "lucide-react";
import Link from "next/link";
import SeverityBadge from "../shared/SeverityBadge";

export default function ReportCard({
  repository,
  date,
  vuln_count,
  top_severity,
  id,
  repoId,
  status,
  progress,
  setSelectedReport,
  setState,
}: {
  repository: string;
  date: string;
  vuln_count: number;
  top_severity: "low" | "medium" | "high";
  id: number;
  repoId: number;
  setState: Dispatch<SetStateAction<boolean>>;
  setSelectedReport: Dispatch<SetStateAction<number>>;
  status: string;
  progress: number;
}) {
  const isCompleted = status === "SUCCESS";

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 hover:shadow-md transition-shadow">
      {/* Repository Name */}
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-blue-600/20 text-blue-600 dark:text-blue-500 p-2 rounded-md">
          <FileText size={20} />
        </div>
        <h2 className="font-bold text-sm text-slate-700 dark:text-slate-200 truncate flex-1">{repository}</h2>
      </div>

      {/* Details */}
      <div className="space-y-3 mb-4">
        {/* Date - Always show */}
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">DATE</span>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {new Date(date).toISOString().split("T")[0]}
          </span>
        </div>

        {isCompleted ? (
          <>
            {/* Success state - show vulnerability info */}
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">VULN. COUNT</span>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{vuln_count}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">TOP SEVERITY</span>
              <SeverityBadge
                level={top_severity}
                className="w-fit min-w-20"
              />
            </div>
          </>
        ) : (
          <>
            {/* In-progress state - show status and progress */}
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">STATUS</span>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300 capitalize">
                {status.toLowerCase()}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">PROGRESS</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 w-10 text-right">
                  {progress}%
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
        <Link
          href={`/dashboard/repositories/${repoId}/report/${id}`}
          className="flex-1"
        >
          <button className="text-sm font-medium bg-slate-100 hover:bg-slate-200 dark:text-slate-200 dark:bg-slate-700 dark:hover:bg-slate-800 rounded-lg duration-200 w-full flex items-center justify-center h-9">
            View
          </button>
        </Link>
        {isCompleted && (
          <button
            onClick={() => {
              setSelectedReport(id);
              setState(true);
            }}
            className="size-9 hover:bg-slate-200 dark:hover:bg-slate-700 flex justify-center items-center shrink-0 rounded-lg duration-200"
          >
            <FileDown className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}
