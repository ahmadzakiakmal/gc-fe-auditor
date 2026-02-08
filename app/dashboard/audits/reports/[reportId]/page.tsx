"use client";

import Breadcrumb from "@/components/shared/Breadcrumb";
import ContentCard from "@/components/shared/ContentCard";
import { Loader2, Edit2, Plus, X, AlertCircle, CheckCircle, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  getReportDetails,
  updateReportSummary,
  updateFinding,
  createFinding,
  deleteFinding,
  auditorSubmitReport,
} from "@/lib/api/data";
import Markdown from "react-markdown";
import Link from "next/link";

interface Finding {
  id: number;
  title: string;
  severity: "high" | "medium" | "low";
  explanation: string;
  recommendation: string;
  status: string;
  dev_comment: string;
  auditor_response: string;
}

interface Report {
  id: number;
  repository_id: number;
  pdf_url: string;
  summary: string;
  status: string;
  progress: number;
  paid: boolean;
  created_at: string;
  username: string;
  repo_url: string;
  repo_name: string;
  findings: Finding[];
}

export default function ReportDetailPage() {
  const router = useRouter();
  const params = useParams();
  const report_id = params.reportId;

  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [isFindingModalOpen, setIsFindingModalOpen] = useState(false);
  const [editingFinding, setEditingFinding] = useState<Finding | null>(null);
  const [auditorResponse, setAuditorResponse] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [summaryDraft, setSummaryDraft] = useState("");
  const [isSavingSummary, setIsSavingSummary] = useState(false);

  const [findingTitle, setFindingTitle] = useState("");
  const [findingSeverity, setFindingSeverity] = useState<"high" | "medium" | "low">("medium");
  const [findingExplanation, setFindingExplanation] = useState("");
  const [findingRecommendation, setFindingRecommendation] = useState("");
  const [findingStatus, setFindingStatus] = useState<"MITIGATION_CONFIRMED" | "PARTIALLY_MITIGATED" | "NOT_MITIGATED">(
    "NOT_MITIGATED",
  );
  const [isSavingFinding, setIsSavingFinding] = useState(false);

  // Confirmation modal states
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmModalData, setConfirmModalData] = useState<{
    title: string;
    message: string;
    confirmText: string;
    onConfirm: () => void;
    variant?: "danger" | "warning";
  } | null>(null);

  const breadcrumbData = [
    { label: "Dashboard", url: "/dashboard" },
    { label: "Audits", url: "/dashboard/audits" },
    { label: `Report #${report_id}`, url: `/dashboard/audits/reports/${report_id}` },
  ];

  // Fetch report data
  useEffect(() => {
    async function fetchReport() {
      try {
        setIsLoading(true);
        const data = await getReportDetails(Number(report_id));
        setReport(data);
        setSummaryDraft(data.summary);
      } catch (error) {
        console.error("Failed to fetch report:", error);
        toast.error(error instanceof Error ? error.message : "Failed to load report");
        router.replace("/error?err=Failed%20To%20Load%20Report&message=Unable%20to%20fetch%20report");
      } finally {
        setIsLoading(false);
      }
    }

    fetchReport();
  }, [report_id, router]);

  // Handle summary edit
  async function handleSaveSummary() {
    if (!summaryDraft.trim()) {
      toast.error("Summary cannot be empty");
      return;
    }
    console.log(report_id);

    try {
      setIsSavingSummary(true);
      await updateReportSummary(Number(report_id), summaryDraft);
      setReport((prev) => (prev ? { ...prev, summary: summaryDraft } : null));
      setIsSummaryModalOpen(false);
      toast.success("Summary updated successfully");
    } catch (error) {
      console.error("Failed to update summary:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update summary");
    } finally {
      setIsSavingSummary(false);
    }
  }

  // Handle finding edit
  function handleEditFinding(finding: Finding) {
    setEditingFinding(finding);
    setFindingTitle(finding.title);
    setFindingSeverity(finding.severity);
    setFindingExplanation(finding.explanation);
    setFindingRecommendation(finding.recommendation);
    setAuditorResponse(finding.auditor_response || "");
    setFindingStatus(
      (finding.status as "MITIGATION_CONFIRMED" | "PARTIALLY_MITIGATED" | "NOT_MITIGATED") || "NOT_MITIGATED",
    );
    setIsFindingModalOpen(true);
  }

  // Handle finding create
  function handleCreateFinding() {
    setEditingFinding(null);
    setFindingTitle("");
    setFindingSeverity("medium");
    setFindingExplanation("");
    setFindingRecommendation("");
    setAuditorResponse("");
    setFindingStatus("NOT_MITIGATED");
    setIsFindingModalOpen(true);
  }

  async function handleSaveFinding() {
    if (!findingTitle.trim() || !findingExplanation.trim() || !findingRecommendation.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSavingFinding(true);

      if (editingFinding) {
        // Update existing finding
        await updateFinding(editingFinding.id, {
          title: findingTitle,
          severity: findingSeverity,
          explanation: findingExplanation,
          recommendation: findingRecommendation,
          auditor_response: auditorResponse,
          status: findingStatus,
        });

        setReport((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            findings: prev.findings.map((f) =>
              f.id === editingFinding.id
                ? {
                    ...f,
                    title: findingTitle,
                    severity: findingSeverity,
                    explanation: findingExplanation,
                    recommendation: findingRecommendation,
                    auditor_response: auditorResponse,
                    status: findingStatus,
                  }
                : f,
            ),
          };
        });
        toast.success("Finding updated successfully");
      } else {
        // Create new finding (status defaults to NOT_MITIGATED on backend)
        const newFinding = await createFinding(Number(report_id), {
          title: findingTitle,
          severity: findingSeverity,
          explanation: findingExplanation,
          recommendation: findingRecommendation,
        });

        setReport((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            findings: [...prev.findings, newFinding],
          };
        });
        toast.success("Finding created successfully");
      }

      setIsFindingModalOpen(false);
    } catch (error) {
      console.error("Failed to save finding:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save finding");
    } finally {
      setIsSavingFinding(false);
    }
  }

  async function handleDeleteFinding(findingId: number) {
    setConfirmModalData({
      title: "Delete Finding",
      message: "Are you sure you want to delete this finding? This action cannot be undone.",
      confirmText: "Delete Finding",
      variant: "danger",
      onConfirm: async () => {
        try {
          await deleteFinding(findingId);

          setReport((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              findings: prev.findings.filter((f) => f.id !== findingId),
            };
          });

          toast.success("Finding deleted successfully");
        } catch (error) {
          console.error("Failed to delete finding:", error);
          toast.error(error instanceof Error ? error.message : "Failed to delete finding");
        } finally {
          setIsConfirmModalOpen(false);
        }
      },
    });
    setIsConfirmModalOpen(true);
  }

  async function handleSubmitReport(status: "NEED_DEV_REMEDIATION" | "DEV_REMEDIATED") {
    const statusLabel = status === "NEED_DEV_REMEDIATION" ? "Need Developer Remediation" : "Remediated";

    setConfirmModalData({
      title: "Submit Report",
      message: `Are you sure you want to mark this report as "${statusLabel}"? The client will be notified of this status change.`,
      confirmText: `Confirm ${statusLabel}`,
      variant: "warning",
      onConfirm: async () => {
        try {
          setIsSubmitting(true);
          const result = await auditorSubmitReport(Number(report_id), status);

          setReport((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              status: status,
            };
          });

          toast.success(`Report status updated to: ${statusLabel}`);
          console.log("Submit result:", result);
        } catch (error) {
          console.error("Failed to submit report:", error);
          toast.error(error instanceof Error ? error.message : "Failed to submit report");
        } finally {
          setIsSubmitting(false);
          setIsConfirmModalOpen(false);
        }
      },
    });
    setIsConfirmModalOpen(true);
  }

  const getMitigationStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; label: string }> = {
      NOT_MITIGATED: {
        color: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
        label: "Not Mitigated",
      },
      PARTIALLY_MITIGATED: {
        color:
          "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
        label: "Partially Mitigated",
      },
      MITIGATION_CONFIRMED: {
        color:
          "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
        label: "Mitigation Confirmed",
      },
    };
    return statusMap[status] || statusMap.NOT_MITIGATED;
  };

  const getSeverityBadge = (severity: string) => {
    const colors = {
      high: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
      medium:
        "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
      low: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    };
    return colors[severity as keyof typeof colors] || colors.medium;
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, string> = {
      AUDITOR_REVIEW: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
      NEED_DEV_REMEDIATION: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
      DONE: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
    };
    return statusMap[status] || "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400";
  };

  if (isLoading) {
    return (
      <div className="font-family-jakarta bg-light-secondary dark:bg-slate-950 w-full h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-slate-400 dark:text-slate-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 font-semibold">Loading report...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <main className="font-family-jakarta bg-light-secondary dark:bg-slate-950 w-full h-screen overflow-y-auto p-10">
        <Breadcrumb data={breadcrumbData} />
        <div className="flex flex-col items-center justify-center py-20">
          <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-4 mb-4">
            <AlertCircle className="w-12 h-12 text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="text-2xl font-semibold text-blue-gc-dark dark:text-white mb-2">Report Not Found</h3>
          <p className="text-slate-600 dark:text-slate-400 text-center max-w-md mb-6">
            The report you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Link
            href="/dashboard/audits"
            className="font-semibold text-white bg-slate-700 hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500 duration-200 rounded-md py-2.5 px-6"
          >
            Back to Reports
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="font-family-jakarta bg-light-secondary dark:bg-slate-950 w-full h-screen overflow-y-auto p-10">
      <Breadcrumb data={breadcrumbData} />

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-[32px] font-semibold text-blue-gc-dark dark:text-white mb-3">
            Audit Report: {report.repo_name}
          </h1>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 min-w-20">Client:</span>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{report.username}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 min-w-20">Repository:</span>
              <Link
                href={report.repo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-family-firamono truncate"
              >
                {report.repo_url}
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 min-w-20">Created:</span>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {new Date(report.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-4">
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${getStatusBadge(report.status)}`}>
            {report.status.replace(/_/g, " ")}
          </span>
          <span
            className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
              report.paid
                ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
            }`}
          >
            {report.paid ? "PAID" : "UNPAID"}
          </span>
        </div>
      </div>

      {/* Executive Summary */}
      <ContentCard className="my-7">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-[24px] font-semibold text-blue-gc-dark dark:text-white">Executive Summary</h2>
          <button
            onClick={() => {
              setSummaryDraft(report.summary);
              setIsSummaryModalOpen(true);
            }}
            className="hover:bg-slate-200 dark:hover:bg-slate-700 p-2 rounded-lg duration-200 text-slate-600 dark:text-slate-400 flex items-center gap-2"
          >
            <Edit2 className="size-5" />
            <span className="text-sm font-semibold">Edit</span>
          </button>
        </div>
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <Markdown>{report.summary}</Markdown>
        </div>
      </ContentCard>

      {/* Findings */}
      <ContentCard className="my-7">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-[24px] font-semibold text-blue-gc-dark dark:text-white">
              Findings ({report.findings.length})
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {report.findings.filter((f) => f.severity === "high").length} high •{" "}
              {report.findings.filter((f) => f.severity === "medium").length} medium •{" "}
              {report.findings.filter((f) => f.severity === "low").length} low
            </p>
          </div>
          <button
            onClick={handleCreateFinding}
            className="font-semibold text-white bg-purple-700 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-500 duration-200 rounded-md py-2 px-3 flex items-center gap-2"
          >
            <Plus size={16} />
            Add Finding
          </button>
        </div>

        {report.findings.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-emerald-500 dark:text-emerald-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">No Issues Found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              This repository passed the security audit with no vulnerabilities detected.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {report.findings.map((finding, index) => (
              <div
                key={finding.id}
                className="pb-6 border-b border-slate-200 dark:border-slate-800 last:border-0 last:pb-0"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-sm font-bold text-slate-400 dark:text-slate-500 mt-1">#{index + 1}</span>
                      <h3 className="text-[18px] font-bold text-slate-700 dark:text-slate-200">{finding.title}</h3>
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full border ${getSeverityBadge(
                          finding.severity,
                        )}`}
                      >
                        {finding.severity.toUpperCase()}
                      </span>
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full border w-max shrink-0 ${
                          getMitigationStatusBadge(finding.status).color
                        }`}
                      >
                        {getMitigationStatusBadge(finding.status).label}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditFinding(finding)}
                      className="hover:bg-slate-200 dark:hover:bg-slate-700 p-2 rounded-lg duration-200 text-slate-600 dark:text-slate-400"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteFinding(finding.id)}
                      className="hover:bg-red-100 dark:hover:bg-red-900/30 p-2 rounded-lg duration-200 text-red-600 dark:text-red-400"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="prose font-bold text-slate-700 dark:text-slate-300 text-sm mb-1">Explanation</h4>
                    <Markdown>{finding.explanation}</Markdown>
                  </div>
                  <div>
                    <h4 className="prose font-bold text-slate-700 dark:text-slate-300 text-sm mb-1">Recommendation</h4>
                    <Markdown>{finding.recommendation}</Markdown>
                  </div>

                  {/* Dev Comment & Auditor Response */}
                  {(finding.dev_comment || finding.auditor_response) && (
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                      {finding.dev_comment && (
                        <div className="mb-3">
                          <h4 className="font-bold text-blue-600 dark:text-blue-400 text-sm mb-1">Developer Comment</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400 italic">{finding.dev_comment}</p>
                        </div>
                      )}
                      {finding.auditor_response && (
                        <div>
                          <h4 className="font-bold text-purple-600 dark:text-purple-400 text-sm mb-1">
                            Auditor Response
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400 italic">
                            {finding.auditor_response}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </ContentCard>

      {/* Submit Report Actions */}
      <ContentCard className="my-7">
        <div className="pb-3 mb-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-[24px] font-semibold text-blue-gc-dark dark:text-white">Submit Report</h2>
          <p className="font-semibold text-grey-dark dark:text-grey-gc text-sm">
            Change report status and notify the client
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Need Dev Remediation Button */}
          <button
            onClick={() => handleSubmitReport("NEED_DEV_REMEDIATION")}
            disabled={isSubmitting}
            className="group relative overflow-hidden bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-lg p-6 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <div className="flex flex-col items-start gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <span className="text-lg">Request Developer Remediation</span>
              </div>
              <p className="text-sm text-amber-100 text-left">
                Issues found require developer fixes. Client will be notified to review and remediate the findings.
              </p>
            </div>
          </button>

          {/* Mark as Done Button */}
          <button
            onClick={() => handleSubmitReport("DEV_REMEDIATED")}
            disabled={isSubmitting}
            className="group relative overflow-hidden bg-linear-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-semibold rounded-lg p-6 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <div className="flex flex-col items-start gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span className="text-lg">Mark as Complete</span>
              </div>
              <p className="text-sm text-emerald-100 text-left">
                Audit is complete. All issues are resolved or no issues were found. Client will receive the final
                report.
              </p>
            </div>
          </button>
        </div>

        {/* Loading overlay */}
        {isSubmitting && (
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm rounded-lg flex items-center justify-center">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 flex items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
              <span className="font-semibold text-slate-700 dark:text-slate-200">Submitting report...</span>
            </div>
          </div>
        )}
      </ContentCard>

      {/* Summary Edit Modal */}
      <div className={`${isSummaryModalOpen ? "flex justify-center items-center fixed inset-0 z-50" : "hidden"}`}>
        <div
          onClick={() => !isSavingSummary && setIsSummaryModalOpen(false)}
          className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        ></div>
        <ContentCard className="relative z-10 w-[90%] max-w-175 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
            <h1 className="font-semibold text-[20px] text-slate-700 dark:text-slate-200">Edit Executive Summary</h1>
            <button
              onClick={() => !isSavingSummary && setIsSummaryModalOpen(false)}
              disabled={isSavingSummary}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 duration-200 disabled:opacity-50"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="mb-4">
            <label className="text-[12px] font-bold text-slate-500 dark:text-slate-400 mb-2 block">
              SUMMARY (Markdown supported)
            </label>
            <textarea
              value={summaryDraft}
              onChange={(e) => setSummaryDraft(e.target.value)}
              disabled={isSavingSummary}
              rows={15}
              className="w-full text-[14px] text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 font-family-firamono disabled:opacity-50"
            />
          </div>

          <button
            onClick={handleSaveSummary}
            disabled={isSavingSummary}
            className="w-full font-semibold text-white bg-slate-700 hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500 duration-200 rounded-md py-2.5 px-3 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSavingSummary ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Summary"
            )}
          </button>
        </ContentCard>
      </div>

      {/* Finding Edit/Create Modal */}
      <div className={`${isFindingModalOpen ? "flex justify-center items-center fixed inset-0 z-50" : "hidden"}`}>
        <div
          onClick={() => !isSavingFinding && setIsFindingModalOpen(false)}
          className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        ></div>
        <ContentCard className="relative z-10 w-[90%] max-w-175 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
            <h1 className="font-semibold text-[20px] text-slate-700 dark:text-slate-200">
              {editingFinding ? "Edit Finding" : "Add New Finding"}
            </h1>
            <button
              onClick={() => !isSavingFinding && setIsFindingModalOpen(false)}
              disabled={isSavingFinding}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 duration-200 disabled:opacity-50"
            >
              <X className="size-5" />
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveFinding();
            }}
            className="space-y-4"
          >
            <div>
              <label className="text-[12px] font-bold text-slate-500 dark:text-slate-400 mb-2 block">
                TITLE <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={findingTitle}
                onChange={(e) => setFindingTitle(e.target.value)}
                disabled={isSavingFinding}
                placeholder="e.g., Reentrancy Vulnerability in withdraw()"
                className="w-full text-[14px] text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="text-[12px] font-bold text-slate-500 dark:text-slate-400 mb-2 block">
                SEVERITY <span className="text-red-500">*</span>
              </label>
              <select
                value={findingSeverity}
                onChange={(e) => setFindingSeverity(e.target.value as "high" | "medium" | "low")}
                disabled={isSavingFinding}
                className="w-full text-[14px] text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 disabled:opacity-50"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="text-[12px] font-bold text-slate-500 dark:text-slate-400 mb-2 block">
                EXPLANATION <span className="text-red-500">*</span>
              </label>
              <textarea
                value={findingExplanation}
                onChange={(e) => setFindingExplanation(e.target.value)}
                disabled={isSavingFinding}
                rows={5}
                placeholder="Describe the vulnerability in detail..."
                className="w-full text-[14px] text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="text-[12px] font-bold text-slate-500 dark:text-slate-400 mb-2 block">
                RECOMMENDATION <span className="text-red-500">*</span>
              </label>
              <textarea
                value={findingRecommendation}
                onChange={(e) => setFindingRecommendation(e.target.value)}
                disabled={isSavingFinding}
                rows={5}
                placeholder="Provide remediation steps and best practices..."
                className="w-full text-[14px] text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="text-[12px] font-bold text-slate-500 dark:text-slate-400 mb-2 block">
                AUDITOR RESPONSE
              </label>
              <textarea
                value={auditorResponse}
                onChange={(e) => setAuditorResponse(e.target.value)}
                disabled={isSavingFinding}
                rows={4}
                placeholder="Optional: Respond to developer's comment or provide additional guidance..."
                className="w-full text-[14px] text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 disabled:opacity-50"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Use this to respond to the developer&apos;s comments or provide additional context
              </p>
            </div>

            <div>
              <label className="text-[12px] font-bold text-slate-500 dark:text-slate-400 mb-2 block">
                MITIGATION STATUS
              </label>
              <select
                value={findingStatus}
                onChange={(e) =>
                  setFindingStatus(e.target.value as "MITIGATION_CONFIRMED" | "PARTIALLY_MITIGATED" | "NOT_MITIGATED")
                }
                disabled={isSavingFinding}
                className="w-full text-[14px] text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 disabled:opacity-50"
              >
                <option value="NOT_MITIGATED">Not Mitigated</option>
                <option value="PARTIALLY_MITIGATED">Partially Mitigated</option>
                <option value="MITIGATION_CONFIRMED">Mitigation Confirmed</option>
              </select>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Mark the current status of this finding after reviewing developer&apos;s remediation
              </p>
            </div>

            <button
              type="submit"
              disabled={isSavingFinding}
              className="w-full font-semibold text-white bg-purple-700 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-500 duration-200 rounded-md py-2.5 px-3 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSavingFinding ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : editingFinding ? (
                "Update Finding"
              ) : (
                "Add Finding"
              )}
            </button>
          </form>
        </ContentCard>
      </div>

      {/* Confirmation Modal */}
      <div className={`${isConfirmModalOpen ? "flex justify-center items-center fixed inset-0 z-50" : "hidden"}`}>
        <div
          onClick={() => setIsConfirmModalOpen(false)}
          className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        ></div>
        <ContentCard className="relative z-10 w-[90%] max-w-125">
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div
                className={`shrink-0 rounded-full p-2 ${
                  confirmModalData?.variant === "danger"
                    ? "bg-red-100 dark:bg-red-900/30"
                    : "bg-amber-100 dark:bg-amber-900/30"
                }`}
              >
                <AlertCircle
                  className={`w-6 h-6 ${
                    confirmModalData?.variant === "danger"
                      ? "text-red-600 dark:text-red-400"
                      : "text-amber-600 dark:text-amber-400"
                  }`}
                />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2">
                  {confirmModalData?.title}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">{confirmModalData?.message}</p>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 duration-200 rounded-md py-2 px-4"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmModalData?.onConfirm()}
                className={`font-semibold text-white duration-200 rounded-md py-2 px-4 ${
                  confirmModalData?.variant === "danger"
                    ? "bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500"
                    : "bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-500"
                }`}
              >
                {confirmModalData?.confirmText}
              </button>
            </div>
          </div>
        </ContentCard>
      </div>
    </main>
  );
}

