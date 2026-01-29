"use client";
import Breadcrumb from "@/components/shared/Breadcrumb";
import ContentCard from "@/components/shared/ContentCard";
import { FileText, Code2, Clock, Play, CheckCircle, X, Plus, Edit2, Trash2, CheckSquare, Square } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import Markdown from "react-markdown";

export default function AuditDetailPage() {
  const params = useParams();
  const audit_id = params.id;

  // Placeholder audit data
  const [audit] = useState({
    id: audit_id,
    repository_name: "smart-contract-vault",
    client: "octocat",
    files_count: 8,
    status: "IN_PROGRESS",
    payment_status: "PAID",
    submitted_date: "2025-01-26T10:30:00Z",
    priority: "high",
    amount: 400,
    files: [
      "contracts/Vault.sol",
      "contracts/VaultFactory.sol",
      "contracts/interfaces/IVault.sol",
      "contracts/libraries/SafeMath.sol",
      "contracts/utils/Pausable.sol",
    ],
  });

  // Available flows
  const [flows] = useState([
    { id: 1, name: "Standard Security Audit", type: "default" },
    { id: 2, name: "DeFi Protocol Review", type: "default" },
    { id: 3, name: "Quick Vulnerability Scan", type: "custom" },
  ]);

  const [selectedFlow, setSelectedFlow] = useState<number | null>(null);
  const [isAuditStarted, setIsAuditStarted] = useState(false);

  // Summary & Findings
  const [summary, setSummary] = useState(
    "# Executive Summary\n\nThis audit is currently in progress. Summary will be added upon completion.",
  );
  const [findings, setFindings] = useState<any[]>([]);

  // Modals
  const [isFlowModalOpen, setIsFlowModalOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [isFindingModalOpen, setIsFindingModalOpen] = useState(false);
  const [editingFinding, setEditingFinding] = useState<any>(null);

  // Form states
  const [newFindingTitle, setNewFindingTitle] = useState("");
  const [newFindingSeverity, setNewFindingSeverity] = useState("medium");
  const [newFindingExplanation, setNewFindingExplanation] = useState("");
  const [newFindingRecommendation, setNewFindingRecommendation] = useState("");

  // Dev remediation review
  const [remediations] = useState([
    {
      finding_id: 1,
      title: "Reentrancy Vulnerability in withdraw()",
      pr_url: "https://github.com/octocat/smart-contract-vault/pull/42",
      status: "PENDING_VALIDATION",
    },
  ]);

  const breadcrumbData = [
    { label: "Dashboard", url: "/dashboard" },
    { label: "Audits", url: "/dashboard/audits" },
    { label: `Audit #${audit_id}`, url: `/dashboard/audits/${audit_id}` },
  ];

  async function handleStartAudit() {
    if (!selectedFlow) {
      toast.error("Please select an audit flow");
      return;
    }

    try {
      // TODO: API call to start audit
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsAuditStarted(true);
      toast.success("Audit started successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to start audit");
    }
  }

  async function handleSaveSummary() {
    try {
      // TODO: API call to save summary
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsSummaryModalOpen(false);
      toast.success("Summary saved");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save summary");
    }
  }

  async function handleSaveFinding() {
    if (!newFindingTitle.trim() || !newFindingExplanation.trim() || !newFindingRecommendation.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      // TODO: API call to save finding
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (editingFinding) {
        // Update existing
        setFindings(
          findings.map((f) =>
            f.id === editingFinding.id
              ? {
                  ...f,
                  title: newFindingTitle,
                  severity: newFindingSeverity,
                  explanation: newFindingExplanation,
                  recommendation: newFindingRecommendation,
                }
              : f,
          ),
        );
        toast.success("Finding updated");
      } else {
        // Add new
        setFindings([
          ...findings,
          {
            id: "",
            title: newFindingTitle,
            severity: newFindingSeverity,
            explanation: newFindingExplanation,
            recommendation: newFindingRecommendation,
          },
        ]);
        toast.success("Finding added");
      }

      setIsFindingModalOpen(false);
      resetFindingForm();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save finding");
    }
  }

  function resetFindingForm() {
    setNewFindingTitle("");
    setNewFindingSeverity("medium");
    setNewFindingExplanation("");
    setNewFindingRecommendation("");
    setEditingFinding(null);
  }

  function handleEditFinding(finding: any) {
    setEditingFinding(finding);
    setNewFindingTitle(finding.title);
    setNewFindingSeverity(finding.severity);
    setNewFindingExplanation(finding.explanation);
    setNewFindingRecommendation(finding.recommendation);
    setIsFindingModalOpen(true);
  }

  async function handleDeleteFinding(id: number) {
    if (!confirm("Are you sure you want to delete this finding?")) return;

    try {
      // TODO: API call to delete finding
      await new Promise((resolve) => setTimeout(resolve, 500));
      setFindings(findings.filter((f) => f.id !== id));
      toast.success("Finding deleted");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete finding");
    }
  }

  async function handleApproveReport() {
    if (findings.length === 0) {
      toast.error("Please add at least one finding before approving");
      return;
    }

    if (!confirm("Are you sure you want to approve this report? This will submit it to the client.")) return;

    try {
      // TODO: API call to approve report
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Report approved and submitted to client");
    } catch (error) {
      console.error(error);
      toast.error("Failed to approve report");
    }
  }

  async function handleValidateRemediation(findingId: number) {
    try {
      // TODO: API call to validate remediation
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Remediation validated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to validate remediation");
    }
  }

  const getSeverityBadge = (severity: string) => {
    const colors = {
      high: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
      medium:
        "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
      low: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    };
    return colors[severity as keyof typeof colors] || colors.medium;
  };

  return (
    <main className="bg-light-secondary dark:bg-slate-950 w-full h-screen overflow-y-auto p-10">
      <Breadcrumb data={breadcrumbData} />

      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-[32px] font-semibold text-blue-gc-dark dark:text-white">
            Audit: {audit.repository_name}
          </h1>
          <p className="font-semibold text-grey-dark dark:text-grey-gc mt-2">
            Client: {audit.client} • {audit.files_count} files • ${audit.amount}
          </p>
        </div>
      </div>

      {/* Audit Flow Selection */}
      {!isAuditStarted && (
        <ContentCard className="my-7">
          <div className="pb-3 mb-4 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-[24px] font-semibold text-blue-gc-dark dark:text-white">Select Audit Flow</h2>
            <p className="font-semibold text-grey-dark dark:text-grey-gc text-sm">
              Choose a workflow template or create a custom flow
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {flows.map((flow) => (
              <div
                key={flow.id}
                onClick={() => setSelectedFlow(flow.id)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedFlow === flow.id
                    ? "border-purple-600 dark:border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={`shrink-0 ${
                      selectedFlow === flow.id
                        ? "text-purple-600 dark:text-purple-400"
                        : "text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    {selectedFlow === flow.id ? <CheckSquare size={18} /> : <Square size={18} />}
                  </div>
                  <h3 className="font-bold text-sm text-slate-700 dark:text-slate-200">{flow.name}</h3>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    flow.type === "default"
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {flow.type === "default" ? "Default" : "Custom"}
                </span>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleStartAudit}
              disabled={!selectedFlow}
              className="font-semibold text-white bg-purple-700 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-500 duration-200 rounded-md py-2.5 px-4 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Play size={18} />
              Start Audit
            </button>
            <button
              onClick={() => setIsFlowModalOpen(true)}
              className="font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-800 duration-200 rounded-md py-2.5 px-4 flex items-center gap-2"
            >
              <Plus size={18} />
              Create Custom Flow
            </button>
          </div>
        </ContentCard>
      )}

      {/* Audit Started - Files in Scope */}
      {isAuditStarted && (
        <>
          <ContentCard className="my-7">
            <div className="pb-3 mb-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-[24px] font-semibold text-blue-gc-dark dark:text-white">Files in Scope</h2>
              <p className="font-semibold text-grey-dark dark:text-grey-gc text-sm">
                {audit.files_count} files selected for audit
              </p>
            </div>
            <div className="space-y-1">
              {audit.files.map((file) => (
                <div
                  key={file}
                  className="flex items-center gap-2 p-2 rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                >
                  <Code2
                    size={14}
                    className="text-slate-400"
                  />
                  <span className="text-sm font-family-firamono text-slate-700 dark:text-slate-300">{file}</span>
                </div>
              ))}
            </div>
          </ContentCard>

          {/* Executive Summary */}
          <ContentCard className="my-7">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-[24px] font-semibold text-blue-gc-dark dark:text-white">Executive Summary</h2>
              </div>
              <button
                onClick={() => setIsSummaryModalOpen(true)}
                className="hover:bg-slate-200 dark:hover:bg-slate-700 p-2 rounded-lg duration-200 text-slate-600 dark:text-slate-400"
              >
                <Edit2 className="size-5" />
              </button>
            </div>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <Markdown>{summary}</Markdown>
            </div>
          </ContentCard>

          {/* Findings */}
          <ContentCard className="my-7">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-[24px] font-semibold text-blue-gc-dark dark:text-white">
                  Findings ({findings.length})
                </h2>
              </div>
              <button
                onClick={() => {
                  resetFindingForm();
                  setIsFindingModalOpen(true);
                }}
                className="font-semibold text-white bg-purple-700 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-500 duration-200 rounded-md py-2 px-3 flex items-center gap-2"
              >
                <Plus size={16} />
                Add Finding
              </button>
            </div>

            {findings.length === 0 && (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                <p>No findings added yet. Click &ldquo;Add Finding&ldquo; to create your first finding.</p>
              </div>
            )}

            <div className="space-y-6">
              {findings.map((finding) => (
                <div
                  key={finding.id}
                  className="pb-6 border-b border-slate-200 dark:border-slate-800 last:border-0 last:pb-0"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-[18px] font-bold text-slate-700 dark:text-slate-200">{finding.title}</h3>
                        <span
                          className={`text-xs font-semibold px-3 py-1 rounded-full border ${getSeverityBadge(
                            finding.severity,
                          )}`}
                        >
                          {finding.severity.toUpperCase()}
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
                      <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm mb-1">Explanation</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{finding.explanation}</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm mb-1">Recommendation</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{finding.recommendation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ContentCard>

          {/* Developer Remediations */}
          {remediations.length > 0 && (
            <ContentCard className="my-7">
              <div className="pb-3 mb-4 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-[24px] font-semibold text-blue-gc-dark dark:text-white">
                  Developer Remediations ({remediations.length})
                </h2>
                <p className="font-semibold text-grey-dark dark:text-grey-gc text-sm">
                  Review and validate developer fixes
                </p>
              </div>

              <div className="space-y-4">
                {remediations.map((rem) => (
                  <div
                    key={rem.finding_id}
                    className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-sm text-slate-700 dark:text-slate-200 mb-2">{rem.title}</h3>
                        <a
                          href={rem.pr_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-family-firamono block mb-3"
                        >
                          {rem.pr_url}
                        </a>
                        <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                          {rem.status.replace("_", " ")}
                        </span>
                      </div>
                      <button
                        onClick={() => handleValidateRemediation(rem.finding_id)}
                        className="font-semibold text-white bg-emerald-700 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 duration-200 rounded-md py-2 px-3 flex items-center gap-2 shrink-0"
                      >
                        <CheckCircle size={16} />
                        Validate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </ContentCard>
          )}

          {/* Approve Report */}
          <ContentCard className="my-7">
            <div className="pb-3 mb-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-[24px] font-semibold text-blue-gc-dark dark:text-white">Finalize & Submit</h2>
              <p className="font-semibold text-grey-dark dark:text-grey-gc text-sm">
                Review all findings and submit the final report to the client
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-800 mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Total Findings</p>
                  <p className="text-2xl font-bold text-slate-700 dark:text-slate-300">{findings.length}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Report Status</p>
                  <p className="text-sm font-bold text-amber-600 dark:text-amber-400">DRAFT</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleApproveReport}
              disabled={findings.length === 0}
              className="w-full font-semibold text-white bg-emerald-700 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 duration-200 rounded-md py-3 px-4 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <CheckCircle size={18} />
              Approve & Submit Report
            </button>
          </ContentCard>
        </>
      )}

      {/* Summary Modal */}
      <div className={`${isSummaryModalOpen ? "flex justify-center items-center fixed inset-0 z-50" : "hidden"}`}>
        <div
          onClick={() => setIsSummaryModalOpen(false)}
          className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        ></div>
        <ContentCard className="relative z-10 w-[90%] max-w-[700px] max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
            <h1 className="font-semibold text-[20px] text-slate-700 dark:text-slate-200">Edit Executive Summary</h1>
            <button
              onClick={() => setIsSummaryModalOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 duration-200"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="mb-4">
            <label className="text-[12px] font-bold text-slate-500 dark:text-slate-400 mb-2 block">
              SUMMARY (Markdown supported)
            </label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={15}
              className="w-full text-[14px] text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 font-family-firamono"
            />
          </div>

          <button
            onClick={handleSaveSummary}
            className="w-full font-semibold text-white bg-slate-700 hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500 duration-200 rounded-md py-2.5 px-3"
          >
            Save Summary
          </button>
        </ContentCard>
      </div>

      {/* Finding Modal */}
      <div className={`${isFindingModalOpen ? "flex justify-center items-center fixed inset-0 z-50" : "hidden"}`}>
        <div
          onClick={() => setIsFindingModalOpen(false)}
          className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        ></div>
        <ContentCard className="relative z-10 w-[90%] max-w-[700px] max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
            <h1 className="font-semibold text-[20px] text-slate-700 dark:text-slate-200">
              {editingFinding ? "Edit Finding" : "Add Finding"}
            </h1>
            <button
              onClick={() => {
                setIsFindingModalOpen(false);
                resetFindingForm();
              }}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 duration-200"
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
              <label className="text-[12px] font-bold text-slate-500 dark:text-slate-400 mb-2 block">TITLE</label>
              <input
                type="text"
                value={newFindingTitle}
                onChange={(e) => setNewFindingTitle(e.target.value)}
                placeholder="e.g., Reentrancy Vulnerability in withdraw()"
                className="w-full text-[14px] text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600"
              />
            </div>

            <div>
              <label className="text-[12px] font-bold text-slate-500 dark:text-slate-400 mb-2 block">SEVERITY</label>
              <select
                value={newFindingSeverity}
                onChange={(e) => setNewFindingSeverity(e.target.value)}
                className="w-full text-[14px] text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="text-[12px] font-bold text-slate-500 dark:text-slate-400 mb-2 block">EXPLANATION</label>
              <textarea
                value={newFindingExplanation}
                onChange={(e) => setNewFindingExplanation(e.target.value)}
                rows={5}
                placeholder="Describe the vulnerability..."
                className="w-full text-[14px] text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600"
              />
            </div>

            <div>
              <label className="text-[12px] font-bold text-slate-500 dark:text-slate-400 mb-2 block">
                RECOMMENDATION
              </label>
              <textarea
                value={newFindingRecommendation}
                onChange={(e) => setNewFindingRecommendation(e.target.value)}
                rows={5}
                placeholder="Provide remediation steps..."
                className="w-full text-[14px] text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600"
              />
            </div>

            <button
              type="submit"
              className="w-full font-semibold text-white bg-purple-700 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-500 duration-200 rounded-md py-2.5 px-3"
            >
              {editingFinding ? "Update Finding" : "Add Finding"}
            </button>
          </form>
        </ContentCard>
      </div>

      {/* Custom Flow Modal - Placeholder */}
      <div className={`${isFlowModalOpen ? "flex justify-center items-center fixed inset-0 z-50" : "hidden"}`}>
        <div
          onClick={() => setIsFlowModalOpen(false)}
          className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        ></div>
        <ContentCard className="relative z-10 w-[90%] max-w-[500px]">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
            <h1 className="font-semibold text-[20px] text-slate-700 dark:text-slate-200">Create Custom Flow</h1>
            <button
              onClick={() => setIsFlowModalOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 duration-200"
            >
              <X className="size-5" />
            </button>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 text-center py-8">
            Custom flow creation coming soon...
          </p>
        </ContentCard>
      </div>
    </main>
  );
}

