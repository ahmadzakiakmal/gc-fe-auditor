"use client";
import Breadcrumb from "@/components/shared/Breadcrumb";
import ContentCard from "@/components/shared/ContentCard";
import { Code2, Play, X, Plus, CheckSquare, Square, Loader2, CheckCircle, ArrowRight } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getRepoFlows, getRepoFunctions, createNewFlow, submitAiScan, getAuditScope } from "@/lib/api/data";
import { Flow, FlowFunction, Report } from "@/types/types";
import TabSwitcher from "@/components/shared/TabSwitcher";
import { Search } from "lucide-react";
import Link from "next/link";
import { useSession } from "@/context/SessionContext";

export default function AuditDetailPage() {
  const params = useParams();
  const audit_id = params.id;
  const { reports } = useSession();
  const router = useRouter();

  const [audit, setAudit] = useState<Report | null>(null); // Use proper type or any for now
  const [isLoadingAudit, setIsLoadingAudit] = useState(true);

  // Flows and functions state
  const [flows, setFlows] = useState<Flow[] | null>(null);
  const [availableFunctions, setAvailableFunctions] = useState<FlowFunction[]>([]);
  const [isLoadingFlows, setIsLoadingFlows] = useState(true);
  const [isLoadingFunctions, setIsLoadingFunctions] = useState(false);
  const [scope, setScope] = useState<{
    in_scope_files: string[];
    out_of_scope_files: string[];
  } | null>(null);

  const [selectedFlows, setSelectedFlows] = useState<string[]>([]);
  const [isAuditStarted, setIsAuditStarted] = useState(false);
  const [auditProgress, setAuditProgress] = useState(0);

  const [flowTypeFilter, setFlowTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals
  const [isFlowModalOpen, setIsFlowModalOpen] = useState(false);

  // Custom flow creation
  const [newFlowName, setNewFlowName] = useState("");
  const [selectedFunctions, setSelectedFunctions] = useState<FlowFunction[]>([]);
  const [isCreatingFlow, setIsCreatingFlow] = useState(false);

  const breadcrumbData = [
    { label: "Dashboard", url: "/dashboard" },
    { label: "Audits", url: "/dashboard/audits" },
    { label: `Audit #${audit_id}`, url: `/dashboard/audits/${audit_id}` },
  ];

  useEffect(() => {
    async function fetchData() {
      try {
        if (!reports) return;
        setIsLoadingAudit(true);
        setIsLoadingFlows(true);

        const foundAudit = reports.find((report) => report.id == Number(audit_id));
        console.log("Report data:", foundAudit);
        if (!foundAudit)
          return router.replace("/error?err=Audit%20not%20found&message=We%20were%20unable%20to%20find%20the%20audit");
        setAudit(foundAudit);

        if (foundAudit.status != "QUEUE") return router.replace(`/dashboard/audits/reports/${audit_id}`);

        const scopeData = await getAuditScope(String(audit_id));
        console.log(scopeData.data.in_scope_files);
        console.log(scopeData.data.out_of_scope_files);
        setScope({
          in_scope_files: scopeData.data.in_scope_files || [],
          out_of_scope_files: scopeData.data.out_of_scope_files || [],
        });

        const flowsData = await getRepoFlows(String(foundAudit.repository_id));
        setFlows(flowsData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error(error instanceof Error ? error.message : "Failed to load audit data");
      } finally {
        setIsLoadingAudit(false);
        setIsLoadingFlows(false);
      }
    }

    fetchData();
  }, [audit_id, reports, router]);

  // Fetch functions when opening custom flow modal
  async function handleOpenFlowModal() {
    setIsFlowModalOpen(true);
    if (availableFunctions.length === 0) {
      try {
        setIsLoadingFunctions(true);
        if (!audit?.repositoryId) return;
        const data = await getRepoFunctions(String(audit.repositoryId));
        console.log(data);

        setAvailableFunctions(data.data || []);
      } catch (error) {
        console.error("Failed to fetch functions:", error);
        toast.error("Failed to load available functions");
      } finally {
        setIsLoadingFunctions(false);
      }
    }
  }

  function toggleFlowSelection(flowId: string) {
    if (selectedFlows.includes(flowId)) {
      setSelectedFlows(selectedFlows.filter((id) => id !== flowId));
    } else {
      setSelectedFlows([...selectedFlows, flowId]);
    }
  }

  function toggleFunctionSelection(func: FlowFunction) {
    const isSelected = selectedFunctions.some((f) => f.function_signature === func.function_signature);
    if (isSelected) {
      setSelectedFunctions(selectedFunctions.filter((f) => f.function_signature !== func.function_signature));
    } else {
      setSelectedFunctions([...selectedFunctions, func]);
    }
  }

  async function handleCreateFlow() {
    if (!newFlowName.trim()) {
      toast.error("Please enter a flow name");
      return;
    }

    if (selectedFunctions.length === 0) {
      toast.error("Please select at least one function");
      return;
    }

    try {
      setIsCreatingFlow(true);
      await createNewFlow(String(audit?.repositoryId), newFlowName, selectedFunctions);
      toast.success("Custom flow created successfully");

      // Refresh flows
      const updatedFlows = await getRepoFlows(String(audit?.repositoryId));
      setFlows(updatedFlows);

      // Reset form
      setNewFlowName("");
      setSelectedFunctions([]);
      setIsFlowModalOpen(false);
    } catch (error) {
      console.error("Failed to create flow:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create flow");
    } finally {
      setIsCreatingFlow(false);
    }
  }

  async function handleStartAudit() {
    if (selectedFlows.length === 0) {
      toast.error("Please select at least one audit flow");
      return;
    }

    if (!flows) return;

    try {
      setIsAuditStarted(true);
      setAuditProgress(0);

      // Separate flows into custom (flow_id) and test (test_name)
      const selectedFlowObjects = flows.filter((f) => selectedFlows.includes(f.name));
      const customFlowIds = selectedFlowObjects
        .filter((f) => f.type === "custom")
        .map((f) => f.id)
        .filter((id): id is number => id !== undefined);
      const testFlowNames = selectedFlowObjects.filter((f) => f.type === "test").map((f) => f.name);

      // Start progress simulation
      const progressInterval = setInterval(() => {
        setAuditProgress((prev) => {
          if (prev >= 90) return prev; // Stop at 90%, let API completion bring it to 100
          return prev + 5;
        });
      }, 1000);

      // Call API
      if (!audit || !audit?.repository_id) {
        return toast.error("Repository id is not defined");
      }
      const result = await submitAiScan(String(audit.repository_id), customFlowIds, testFlowNames);

      // Clear interval and complete progress
      clearInterval(progressInterval);
      setAuditProgress(100);

      toast.success("AI audit scan sent successfully");
      console.log("Scan result:", result);
    } catch (error) {
      console.error("Failed to start audit:", error);
      toast.error(error instanceof Error ? error.message : "Failed to start audit");
      setIsAuditStarted(false);
      setAuditProgress(0);
    }
  }

  const filteredFlows = flows
    ? flows.filter((flow) => {
        // Type filter
        const matchesType = flowTypeFilter === "all" || flow.type === flowTypeFilter;

        // Search filter
        const matchesSearch =
          searchQuery === "" ||
          flow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          flow.file_path?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          flow.flow?.some((func) => func.function_name?.toLowerCase().includes(searchQuery.toLowerCase()));

        return matchesType && matchesSearch;
      })
    : [];

  if (isLoadingAudit || !audit || !scope)
    return (
      <div className="font-family-jakarta bg-light-secondary dark:bg-slate-950 w-full h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-slate-400 dark:text-slate-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 font-semibold">Loading audit details...</p>
        </div>
      </div>
    );

  return (
    <main className="font-family-jakarta bg-light-secondary dark:bg-slate-950 w-full h-screen overflow-y-auto p-10">
      <Breadcrumb data={breadcrumbData} />

      <div className="flex items-start justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-[32px] font-semibold text-blue-gc-dark dark:text-white mb-3">
            Audit: {audit.repo_url.split("/").pop()}
          </h1>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 min-w-20">Client:</span>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {audit.username || audit.repo_url.split("/")[3]}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 min-w-20">Repository:</span>
              <Link
                href={audit.repo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-family-firamono truncate"
              >
                {audit.repo_url}
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 min-w-20">Created:</span>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {new Date(audit.created_at).toLocaleDateString("en-US", {
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
          <span
            className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
              audit?.paid
                ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
            }`}
          >
            {audit?.paid ? "PAID" : "UNPAID"}
          </span>
          <span
            className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
              isAuditStarted
                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 animate-pulse"
                : getStatusBadge(audit?.status).color
            }`}
          >
            {isAuditStarted ? "SCANNING" : getStatusBadge(audit?.status).label}
          </span>
        </div>
      </div>

      {/* Files in Scope */}
      <ContentCard className="my-7">
        <div className="pb-3 mb-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-[24px] font-semibold text-blue-gc-dark dark:text-white">Audit Scope</h2>
          <p className="font-semibold text-grey-dark dark:text-grey-gc text-sm">
            {(scope?.in_scope_files || []).length || 0} files in scope
            {(scope?.out_of_scope_files || []).length > 0 && ` • ${scope.out_of_scope_files.length} excluded`}
          </p>
        </div>

        {/* In Scope Files */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400"></div>
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              IN SCOPE ({scope?.in_scope_files?.length || 0})
            </h3>
          </div>
          <div className="max-h-48 overflow-y-auto space-y-1">
            {scope && scope.in_scope_files?.length > 0 ? (
              scope.in_scope_files?.map((file, index) => (
                <div
                  key={`in-${index}`}
                  className="flex items-center gap-2 p-2 rounded-md bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/20 transition-colors"
                >
                  <Code2
                    size={14}
                    className="text-emerald-600 dark:text-emerald-400 shrink-0"
                  />
                  <span className="text-sm font-family-firamono text-slate-700 dark:text-slate-300 break-all">
                    {file}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400 italic text-center py-4">No files in scope</p>
            )}
          </div>
        </div>

        {/* Out of Scope Files */}
        {scope && scope.out_of_scope_files?.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500"></div>
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                OUT OF SCOPE ({scope.out_of_scope_files?.length})
              </h3>
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {scope.out_of_scope_files?.map((file, index) => (
                <div
                  key={`out-${index}`}
                  className="flex items-center gap-2 p-2 rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 opacity-60"
                >
                  <Code2
                    size={14}
                    className="text-slate-400 dark:text-slate-500 shrink-0"
                  />
                  <span className="text-sm font-family-firamono text-slate-600 dark:text-slate-400 break-all">
                    {file}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </ContentCard>

      {/* Audit Flow Selection */}
      {!isAuditStarted && (
        <ContentCard className="my-7">
          <div className="pb-3 mb-4 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-[24px] font-semibold text-blue-gc-dark dark:text-white">
              Select Audit Flows ({selectedFlows.length} selected)
            </h2>
            <p className="font-semibold text-grey-dark dark:text-grey-gc text-sm">
              Choose test flows or create custom flows to analyze execution paths
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
            <TabSwitcher
              data={[
                { label: "All Flows", value: "all" },
                { label: "Test Flows", value: "test" },
                { label: "Custom Flows", value: "custom" },
              ]}
              state={flowTypeFilter}
              setState={setFlowTypeFilter}
            />

            <div className="relative flex-1 w-full sm:max-w-80">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                size={16}
              />
              <input
                type="text"
                placeholder="Search flows, files, or functions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-600 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {isLoadingFlows ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
            </div>
          ) : filteredFlows.length === 0 ? (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              {flows && flows.length > 0 ? (
                <>
                  <p className="mb-2">No flows match your filters</p>
                  <button
                    onClick={() => {
                      setFlowTypeFilter("all");
                      setSearchQuery("");
                    }}
                    className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    Clear filters
                  </button>
                </>
              ) : (
                <p className="mb-4">No flows available. Create a custom flow to get started.</p>
              )}
            </div>
          ) : (
            <>
              {/* Results count */}
              {(flowTypeFilter !== "all" || searchQuery !== "") && (
                <div className="mb-3 text-sm text-slate-600 dark:text-slate-400">
                  Showing {filteredFlows.length} of {flows?.length || 0} flows
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 mb-4 max-h-125 overflow-y-auto">
                {filteredFlows.map((flow, index) => {
                  const isSelected = selectedFlows.includes(flow.name);
                  return (
                    <div
                      key={`flow-${index}`}
                      onClick={() => toggleFlowSelection(flow.name)}
                      className={`rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected
                          ? "border-purple-600 dark:border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                      }`}
                    >
                      {/* Header */}
                      <div className="p-4 flex items-center gap-3">
                        <div
                          className={`shrink-0 ${
                            isSelected ? "text-purple-600 dark:text-purple-400" : "text-slate-400 dark:text-slate-500"
                          }`}
                        >
                          {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm text-slate-700 dark:text-slate-200 wrap-break-word">
                            {flow.name}
                          </h3>
                        </div>
                        <span
                          className={`shrink-0 text-xs px-2 py-0.5 rounded-full ${
                            flow.type === "test"
                              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                              : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                          }`}
                        >
                          {flow.type === "test" ? "Test Flow" : "Custom"}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="px-4 pb-4 border-t border-slate-200 dark:border-slate-800 pt-3 space-y-3">
                        {/* File Path */}
                        {flow.file_path && (
                          <div>
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">FILE PATH</p>
                            <div className="text-xs bg-slate-100 dark:bg-slate-800 rounded px-2 py-1 font-family-firamono text-slate-700 dark:text-slate-300 break-all">
                              {flow.file_path}
                            </div>
                          </div>
                        )}

                        {/* Functions */}
                        <div>
                          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                            FUNCTIONS ({flow.flow?.length || 0})
                          </p>
                          {flow.flow && flow.flow.length > 0 ? (
                            <div className="flex items-center gap-1 overflow-x-auto pb-2">
                              {flow.flow.map((func, idx: number) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-1 shrink-0"
                                >
                                  <div className="text-xs bg-slate-100 dark:bg-slate-800 rounded px-2 py-1 font-family-firamono text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                    {func.function_name || "Unnamed"}
                                  </div>
                                  {idx < flow.flow.length - 1 && (
                                    <ArrowRight
                                      size={14}
                                      className="text-slate-400 dark:text-slate-500"
                                    />
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400 italic">No functions in this flow</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleStartAudit}
              disabled={selectedFlows.length === 0}
              className="font-semibold text-white bg-purple-700 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-500 duration-200 rounded-md py-2.5 px-4 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Play size={18} />
              Start AI Audit Scan
            </button>
            <button
              onClick={handleOpenFlowModal}
              className="font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-800 duration-200 rounded-md py-2.5 px-4 flex items-center gap-2"
            >
              <Plus size={18} />
              Create Custom Flow
            </button>
          </div>
        </ContentCard>
      )}

      {/* Audit Progress */}
      {isAuditStarted && (
        <ContentCard className="my-7">
          <div className="pb-3 mb-4 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-[24px] font-semibold text-blue-gc-dark dark:text-white">AI Audit Scan Progress</h2>
            <p className="font-semibold text-grey-dark dark:text-grey-gc text-sm">
              Analyzing {selectedFlows.length} flow{selectedFlows.length > 1 ? "s" : ""} for security vulnerabilities
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Requesting Scan</span>
              <span className="text-sm font-bold text-purple-600 dark:text-purple-400">{auditProgress}%</span>
            </div>
            <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-purple-600 to-blue-600 transition-all duration-500"
                style={{ width: `${auditProgress}%` }}
              ></div>
            </div>

            {auditProgress === 100 ? (
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4 flex items-start gap-3">
                <CheckCircle className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Scan Complete</p>
                  <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-1">
                    AI analysis finished. Results are being compiled for human auditor review.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3">
                <Loader2 className="size-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5 animate-spin" />
                <div>
                  <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">Analyzing Code Flows</p>
                  <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                    AI is examining execution paths for potential security vulnerabilities...
                  </p>
                </div>
              </div>
            )}

            {/* Selected Flows Summary */}
            <div className="mt-6">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3">
                SELECTED FLOWS ({selectedFlows.length})
              </p>
              <div className="space-y-2">
                {flows &&
                  flows
                    .filter((f) => selectedFlows.includes(f.name))
                    .map((flow) => (
                      <div
                        key={flow.name}
                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <Code2
                            size={14}
                            className="text-slate-400"
                          />
                          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{flow.name}</span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              flow.type === "test"
                                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                                : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                            }`}
                          >
                            {flow.type === "test" ? "Test" : "Custom"}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {flow.flow?.length || 0} functions
                        </span>
                      </div>
                    ))}
              </div>
            </div>
          </div>
        </ContentCard>
      )}

      {/* Custom Flow Creation Modal */}
      <div className={`${isFlowModalOpen ? "flex justify-center items-center fixed inset-0 z-50" : "hidden"}`}>
        <div
          onClick={() => !isCreatingFlow && setIsFlowModalOpen(false)}
          className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        ></div>
        <ContentCard className="relative z-10 w-[90%] max-w-200 max-h-[95vh] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
            <h1 className="font-semibold text-[20px] text-slate-700 dark:text-slate-200">Create Custom Flow</h1>
            <button
              onClick={() => !isCreatingFlow && setIsFlowModalOpen(false)}
              disabled={isCreatingFlow}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 duration-200 disabled:opacity-50"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="mb-4">
              <label className="text-[12px] font-bold text-slate-500 dark:text-slate-400 mb-2 block">FLOW NAME</label>
              <input
                type="text"
                value={newFlowName}
                onChange={(e) => setNewFlowName(e.target.value)}
                placeholder="e.g., Deposit and Withdraw Flow"
                disabled={isCreatingFlow}
                className="w-full text-[14px] text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 disabled:opacity-50"
              />
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[12px] font-bold text-slate-500 dark:text-slate-400">
                  SELECTED FUNCTIONS ({selectedFunctions.length})
                </label>
                {selectedFunctions.length > 0 && (
                  <button
                    onClick={() => setSelectedFunctions([])}
                    disabled={isCreatingFlow}
                    className="text-xs text-red-600 dark:text-red-400 hover:underline disabled:opacity-50"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="min-h-15 max-h-30 overflow-y-auto bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-2">
                {selectedFunctions.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">
                    No functions selected. Choose from available functions below.
                  </p>
                ) : (
                  <div className="flex gap-1 max-w-full flex-wrap">
                    {selectedFunctions.map((func, idx) => (
                      <div
                        className="flex items-center gap-1"
                        key={func.function_signature}
                      >
                        <div className="flex gap-1 items-center justify-between bg-white dark:bg-slate-800 rounded px-2 py-1.5 border border-slate-200 dark:border-slate-700">
                          <span className="text-xs font-family-firamono text-slate-700 dark:text-slate-300 leading-1">
                            {func.function_name}
                          </span>
                          <button
                            onClick={() => toggleFunctionSelection(func)}
                            disabled={isCreatingFlow}
                            className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50"
                          >
                            <X size={14} />
                          </button>
                        </div>
                        {idx + 1 != selectedFunctions.length && <ArrowRight size={14} />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="text-[12px] font-bold text-slate-500 dark:text-slate-400 mb-2 block">
                AVAILABLE FUNCTIONS
              </label>
              {isLoadingFunctions ? (
                <div className="flex items-center justify-center py-12 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md">
                  <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
                </div>
              ) : availableFunctions.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md">
                  <p className="text-sm text-slate-500 dark:text-slate-400">No functions available</p>
                </div>
              ) : (
                <div className="max-h-75 overflow-y-auto bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-2">
                  <div className="space-y-1">
                    {availableFunctions.map((func) => {
                      const isSelected = selectedFunctions.some(
                        (f) => f.function_signature === func.function_signature,
                      );
                      return (
                        <button
                          key={func.function_signature}
                          onClick={() => toggleFunctionSelection(func)}
                          disabled={isCreatingFlow}
                          className={`w-full text-left px-3 py-2 rounded text-xs font-family-firamono transition-colors disabled:opacity-50 ${
                            isSelected
                              ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800"
                              : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {isSelected ? <CheckSquare size={14} /> : <Square size={14} />}
                            <span>{func.function_name || "Unnamed function"}</span>
                          </div>
                          {func.file_path && (
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 ml-5">{func.file_path}</div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={handleCreateFlow}
              disabled={isCreatingFlow || !newFlowName.trim() || selectedFunctions.length === 0}
              className="w-full font-semibold text-white bg-purple-700 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-500 duration-200 rounded-md py-2.5 px-3 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isCreatingFlow ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Flow...</span>
                </>
              ) : (
                <>
                  <Plus size={18} />
                  <span>Create Flow</span>
                </>
              )}
            </button>
          </div>
        </ContentCard>
      </div>
    </main>
  );
}

const getStatusBadge = (status: string) => {
  const statusMap: Record<string, { color: string; label: string }> = {
    QUEUE: {
      color: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
      label: "In Queue",
    },
    AI_REVIEW: {
      color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
      label: "AI Review",
    },
    AUDITOR_REVIEW: {
      color: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
      label: "Auditor Review",
    },
    NEED_DEV_REMEDIATION: {
      color: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
      label: "Needs Remediation",
    },
    DEV_REMEDIATED: {
      color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
      label: "Dev Remediated",
    },
    DONE: {
      color: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
      label: "Completed",
    },
  };
  return statusMap[status] || statusMap.QUEUE;
};

